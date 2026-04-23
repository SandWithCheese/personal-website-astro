import * as THREE from "three";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  InstancedRigidBodies,
  Physics,
  type RapierRigidBody,
  type InstancedRigidBodyProps,
} from "@react-three/rapier";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
// ── Boid tuning ────────────────────────────────────────────────────────────────
const MAX_SPEED = 1.75; // raised: fast burst when catching up
const MIN_SPEED = 1.75; // new: slow down when crowded to create wave clashing
const SEP_RADIUS = 0.5; // boids closer than this push each other away
const ALI_RADIUS = 1.0; // keep alignment radius tight
const COH_RADIUS = 1.6; // slightly larger cohesion to pull nearby stragglers
const SEP_INTENSITY = 1;
const SEP_WEIGHT = 2.2;
const ALI_WEIGHT = 1.5; // ↑ stronger alignment (less chaos, more schooling)
const COH_WEIGHT = 0.8; // ↑ stronger cohesion (tightens the pods)
const WANDER_WEIGHT = 0.4; // ↓ less random veering
const WANDER_RATE = 0.08; // ↓ slower random turning
const TURN_SPEED = 0.12;
// Cap how much the TOTAL acceleration can change velocity per frame.
// Dropping this to 0.1 acts like "inertia" and ensures buttery smooth curves instead of jitter.
const MAX_STEER = 0.05;

// ── Force functions ────────────────────────────────────────────────────────────

// Steer away from close neighbours; closer = stronger repulsion (a/d hyperbola)
function calcSeparation(
  pos: THREE.Vector2,
  neighborPositions: THREE.Vector2[],
): THREE.Vector2 {
  const force = new THREE.Vector2();
  for (const n of neighborPositions) {
    const diff = pos.clone().sub(n);
    const d = diff.length();
    if (d > 0) force.addScaledVector(diff.normalize(), SEP_INTENSITY / d);
  }
  if (neighborPositions.length > 0)
    force.divideScalar(neighborPositions.length);
  return force;
}

// Steer toward the average velocity of neighbours (match heading)
function calcAlignment(
  vel: THREE.Vector2,
  neighborVelocities: THREE.Vector2[],
): THREE.Vector2 {
  if (neighborVelocities.length === 0) return new THREE.Vector2();
  const avg = new THREE.Vector2();
  for (const v of neighborVelocities) avg.add(v);
  avg.divideScalar(neighborVelocities.length);
  return avg.sub(vel); // delta toward group average
}

// Steer toward the centre of mass of neighbours (stay in the group)
function calcCohesion(
  pos: THREE.Vector2,
  neighborPositions: THREE.Vector2[],
): THREE.Vector2 {
  if (neighborPositions.length === 0) return new THREE.Vector2();
  const center = new THREE.Vector2();
  for (const n of neighborPositions) center.add(n);
  center.divideScalar(neighborPositions.length);
  return center.sub(pos);
}

// ── Component ──────────────────────────────────────────────────────────────────
function TrianglesBoids2D({ count = 10 }) {
  const meshRef = useRef<THREE.InstancedMesh | null>(null);
  const rigidBodyRefs = useRef<(RapierRigidBody | null)[]>(
    Array(count).fill(null),
  );
  const { camera } = useThree();

  // Per-boid wander angle — drifts slowly each frame for organic randomness
  const wanderAngles = useRef<number[]>(
    Array.from({ length: count }, () => Math.random() * Math.PI * 2),
  );
  // Per-boid current heading — lerped toward target so turns feel gradual
  const headingAngles = useRef<number[]>(
    Array.from({ length: count }, () => Math.random() * Math.PI * 2),
  );

  // Each instance gets a random spawn position and a random initial velocity.
  // The heading (Z rotation) is aligned to that velocity so the tip faces forward.
  const instances = useMemo<InstancedRigidBodyProps[]>(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const vx = Math.cos(angle) * MAX_SPEED;
      const vy = Math.sin(angle) * MAX_SPEED;
      // Triangle tip is local +Y. When rotated θ around Z, world forward = (-sinθ, cosθ).
      // To align that to (vx, vy) we need θ = atan2(-vx, vy).
      const heading = Math.atan2(-vx, vy);
      return {
        key: `triangle-${i}`,
        position: [
          (Math.random() - 0.5) * 6, // spawn within ±3 units — inside the visible screen
          (Math.random() - 0.5) * 6,
          0,
        ] as [number, number, number],
        rotation: [0, 0, heading] as [number, number, number],
        linearVelocity: [vx, vy, 0] as [number, number, number],
      };
    });
  }, [count]);

  useFrame(() => {
    const bodies = rigidBodyRefs.current;
    if (!bodies.length) return;

    // ── Frustum bounds at z=0 ───────────────────────────────────────────────
    const cam = camera as THREE.PerspectiveCamera;
    const halfH = Math.tan((cam.fov / 2) * (Math.PI / 180)) * cam.position.z;
    const halfW = halfH * cam.aspect;
    const boundX = halfW + 0.3;
    const boundY = halfH + 0.3;

    // ── Snapshot positions + velocities before mutating anything ────────────
    // O(n) reads — all writes happen after, so forces are applied simultaneously
    const positions: (THREE.Vector2 | null)[] = bodies.map((b) =>
      b ? new THREE.Vector2(b.translation().x, b.translation().y) : null,
    );
    const velocities: (THREE.Vector2 | null)[] = bodies.map((b) =>
      b ? new THREE.Vector2(b.linvel().x, b.linvel().y) : null,
    );

    // ── Update each boid ────────────────────────────────────────────────────
    bodies.forEach((body, i) => {
      if (!body) return;
      const pos = positions[i]!;
      const vel = velocities[i]!;

      // Bucket neighbours by radius — O(n²), fine for small-to-medium flocks.
      // For large flocks, replace with a KD-Tree (see article).
      const sepNeighborPos: THREE.Vector2[] = [];
      const aliNeighborVels: THREE.Vector2[] = [];
      const cohNeighborPos: THREE.Vector2[] = [];

      positions.forEach((nPos, j) => {
        if (i === j || !nPos || !velocities[j]) return;
        const dist = pos.distanceTo(nPos);
        if (dist < SEP_RADIUS) sepNeighborPos.push(nPos);
        if (dist < ALI_RADIUS) aliNeighborVels.push(velocities[j]!);
        if (dist < COH_RADIUS) cohNeighborPos.push(nPos);
      });

      // ── Three flocking forces ───────────────────────────────────
      const sep = calcSeparation(pos, sepNeighborPos).multiplyScalar(
        SEP_WEIGHT,
      );
      const ali = calcAlignment(vel, aliNeighborVels).multiplyScalar(
        ALI_WEIGHT,
      );
      const coh = calcCohesion(pos, cohNeighborPos).multiplyScalar(COH_WEIGHT);

      // ── Wander force ─────────────────────────────────────────────────────
      wanderAngles.current[i] += (Math.random() - 0.5) * 2 * WANDER_RATE;
      const wander = new THREE.Vector2(
        Math.cos(wanderAngles.current[i]),
        Math.sin(wanderAngles.current[i]),
      ).multiplyScalar(WANDER_WEIGHT);

      // New velocity = current + clamped steering delta.
      // By clamping the TOTAL steer force to a tiny number (0.1), velocity can only
      // change by a small fraction each frame. This physically prevents jittering.
      const steer = sep
        .clone()
        .add(ali)
        .add(coh)
        .add(wander)
        .clampLength(0, MAX_STEER);
      let newVel = vel.clone().add(steer);

      // Variable speed logic (no more locked max speed)
      if (newVel.length() > 0) newVel.clampLength(MIN_SPEED, MAX_SPEED);
      else newVel.set(0, MIN_SPEED);

      body.setLinvel({ x: newVel.x, y: newVel.y, z: 0 }, true);

      // ── Rotate toward velocity direction (angular lerp) ─────────────────
      // Compute the target heading angle from the desired velocity.
      const targetAngle = Math.atan2(-newVel.x, newVel.y);

      // Find the shortest angular delta (handles the -π / +π wraparound).
      let delta = targetAngle - headingAngles.current[i];
      while (delta > Math.PI) delta -= 2 * Math.PI;
      while (delta < -Math.PI) delta += 2 * Math.PI;

      // Advance heading by at most TURN_SPEED radians — smooth bank, not snap.
      headingAngles.current[i] +=
        Math.sign(delta) * Math.min(Math.abs(delta), TURN_SPEED);

      const h = headingAngles.current[i];
      body.setRotation(
        { x: 0, y: 0, z: Math.sin(h / 2), w: Math.cos(h / 2) },
        true,
      );

      // ── Screen wrap (toroidal world) ──────────────────────────────────────
      let { x, y } = pos;
      let wrapped = false;
      if (x > boundX) {
        x = -boundX;
        wrapped = true;
      } else if (x < -boundX) {
        x = boundX;
        wrapped = true;
      }
      if (y > boundY) {
        y = -boundY;
        wrapped = true;
      } else if (y < -boundY) {
        y = boundY;
        wrapped = true;
      }
      if (wrapped) body.setTranslation({ x, y, z: 0 }, true);
    });
  });

  return (
    <InstancedRigidBodies
      ref={rigidBodyRefs}
      instances={instances}
      colliders="hull"
      sensor // makes them pass through each other physically without losing mass
      scale={0.2}
      gravityScale={0}
    >
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <TriangleGeometry />
        <meshBasicMaterial color="#7a7a7a" side={THREE.DoubleSide} />
      </instancedMesh>
    </InstancedRigidBodies>
  );
}

function TriangleGeometry() {
  const f32array = useMemo(() => {
    const vertices = [
      new THREE.Vector3(0, 0.3, 0),
      new THREE.Vector3(-0.15, -0.2, 0),
      new THREE.Vector3(0.15, -0.2, 0),
    ];
    return Float32Array.from(vertices.flatMap((v) => v.toArray()));
  }, []);

  return (
    <bufferGeometry>
      <bufferAttribute attach="attributes-position" args={[f32array, 3]} />
    </bufferGeometry>
  );
}

function Boids() {
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={containerRef} className="h-screen">
      <Canvas gl={{ alpha: true }} frameloop={isVisible ? "always" : "never"}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={1.5} />
          <directionalLight position={[-5, -3, -5]} intensity={0.4} />
          <Physics>
            <TrianglesBoids2D count={100} />
          </Physics>
          <Html
            fullscreen
            zIndexRange={[9, 0]}
            style={{ pointerEvents: "none" }}
          >
            <div className="flex h-screen w-full flex-col items-center justify-center gap-4 px-4 text-center">
              <h1
                className="text-3xl font-extrabold sm:text-5xl lg:text-6xl"
                style={{ pointerEvents: "auto" }}
              >
                Ahmad Naufal Ramadan
              </h1>
              <p
                className="text-muted-foreground text-sm sm:text-base lg:text-lg"
                style={{ pointerEvents: "auto" }}
              >
                Software Engineer and Recreational Programmer
              </p>
            </div>
          </Html>
        </Suspense>
      </Canvas>
    </section>
  );
}

export default Boids;
