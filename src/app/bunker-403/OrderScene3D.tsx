'use client';

import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Decal, Environment, Center, useTexture, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

function AdminDecal({ design, targetMesh }: { design: any, targetMesh: THREE.Mesh }) {
  // Solo llamamos al hook si la URL es válida para evitar el crash "Could not load undefined"
  const texture = useTexture(design.url);

  useMemo(() => {
    if (texture) {
      (texture as any).anisotropy = 16;
      (texture as any).colorSpace = THREE.SRGBColorSpace;
      (texture as any).minFilter = THREE.LinearFilter;
      (texture as any).magFilter = THREE.LinearFilter;
    }
  }, [texture]);

  const getDecalProps = () => {
    const [x, y] = design.position || [0, 0, 0];
    const [sx, sy] = design.scale || [0.3, 0.3, 0.3];
    const r = (design.rotation && design.rotation[2]) || 0;
    const depth = 2.0;

    if (design.zone === 'front') {
      return { pos: [x, y + 0.6, 1.0] as [number, number, number], rot: [0, 0, r] as [number, number, number], s: [sx, sy, depth] as [number, number, number] };
    }
    if (design.zone === 'back') {
      return { pos: [x, y + 0.6, -1.0] as [number, number, number], rot: [0, Math.PI, r] as [number, number, number], s: [sx, sy, depth] as [number, number, number] };
    }
    if (design.zone === 'sleeve-l') {
      return { pos: [-1.0, y + 0.6, x] as [number, number, number], rot: [0, -Math.PI / 2, r] as [number, number, number], s: [sx, sy, depth] as [number, number, number] };
    }
    if (design.zone === 'sleeve-r') {
      return { pos: [1.0, y + 0.6, -x] as [number, number, number], rot: [0, Math.PI / 2, r] as [number, number, number], s: [sx, sy, depth] as [number, number, number] };
    }
    return null;
  };

  const props = getDecalProps();
  if (!props) return null;

  return (
    <Decal mesh={{ current: targetMesh } as any} position={props.pos} rotation={props.rot} scale={props.s}>
      <meshStandardMaterial map={texture as any} transparent alphaTest={0.001} polygonOffset polygonOffsetFactor={-1} roughness={1} metalness={0} toneMapped={false} />
    </Decal>
  );
}

function GarmentPreview({ order }: { order: any }) {
  const modelPath = order.garmentType === 'CAMISA' ? '/models/camisa.glb' : '/models/buso.glb';
  const { nodes } = useGLTF(modelPath) as any;
  const meshes = Object.values(nodes).filter((n: any) => n.isMesh) as THREE.Mesh[];

  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color(order.garmentColor || '#FFFFFF'),
    roughness: 1,
    metalness: 0
  }), [order.garmentColor]);

  // Manejar el nuevo formato envuelto { payload: [...] }
  const rawDesigns = typeof order.designs === 'string' ? JSON.parse(order.designs) : order.designs;
  const designsList = (rawDesigns?.payload || rawDesigns || []) as any[];

  return (
    <group scale={1.8} position={[0, -1, 0]}>
      {meshes.map((mesh) => (
        <mesh key={mesh.uuid} geometry={mesh.geometry} material={mat}>
          {Array.isArray(designsList) && designsList.map((d: any, i: number) => (
            // FILTRO CRÍTICO: Solo renderizar si tiene URL válida
            d.url ? <AdminDecal key={i} design={d} targetMesh={mesh} /> : null
          ))}
        </mesh>
      ))}
    </group>
  );
}

export default function OrderScene3D({ order }: { order: any }) {
  return (
    <Canvas shadows camera={{ position: [0, 0, 3.5], fov: 40 }} onCreated={({ gl }) => {
      gl.setClearColor('#050505');
    }}>
      <Suspense fallback={null}>
        <ambientLight intensity={1.5} />
        <spotLight position={[10, 10, 10]} intensity={10} castShadow />
        <Environment preset="night" />
        <Center>
          <GarmentPreview order={order} />
        </Center>
        <OrbitControls enablePan={false} minDistance={2} maxDistance={6} rotateSpeed={0.5} autoRotate autoRotateSpeed={0.5} />
        <ContactShadows position={[0, -1.2, 0]} opacity={0.6} scale={10} blur={3} far={2} />
      </Suspense>
    </Canvas>
  );
}
