import React, { useState, Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Box as DreiBox, Environment, Grid, Cylinder, Line, Html, Center } from '@react-three/drei';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';
import { IFCLoader } from 'web-ifc-three/IFCLoader';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

// ----------------------------------------------------------------------------
// 3D HELPER SUBCOMPONENTS
// ----------------------------------------------------------------------------

function SnapshotHelper() {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.warn('[WebGL] Context lost, preventing default to enable restoration.');
    };
    const handleContextRestored = () => {
      console.log('[WebGL] Context restored successfully.');
      try {
        gl.render(scene, camera);
      } catch (err) {
        console.warn('[WebGL] Re-render after restore failed:', err);
      }
    };

    const canvas = gl.domElement;
    canvas.addEventListener('webglcontextlost', handleContextLost, false);
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false);

    (window as any).captureBimSnapshot = () => {
      try {
        gl.render(scene, camera);
        return canvas.toDataURL('image/png');
      } catch (err) {
        console.warn('Snapshot capture warning:', err);
        return null;
      }
    };
    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      delete (window as any).captureBimSnapshot;
    };
  }, [gl, scene, camera]);
  return null;
}

class ModelErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode; onError?: (error: any) => void },
  { hasError: boolean; error: any }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    console.error('3D Model render error caught by ModelErrorBoundary:', error, info);
    this.props.onError?.(error);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function IfcModel({
  url,
  onSelect,
  t,
}: {
  url: string;
  onSelect: (id: string, details: any) => void;
  t: (key: string) => string;
}) {
  const [model, setModel] = useState<any>(null);
  const [scale, setScale] = useState<number>(1);
  const { addToast } = useToast();

  useEffect(() => {
    const loader = new IFCLoader();
    loader.ifcManager.setWasmPath('https://unpkg.com/web-ifc@0.0.36/');
    loader.load(
      url,
      (ifcModel) => {
        ifcModel.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(ifcModel);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        setScale(maxDim > 0 ? 8 / maxDim : 1);

        ifcModel.traverse((child: any) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((m: any) => {
                  m.side = THREE.DoubleSide;
                });
              } else {
                child.material.side = THREE.DoubleSide;
              }
            }
          }
        });
        setModel(ifcModel);
      },
      undefined,
      (error) => {
        console.error('Error loading IFC:', error);
        addToast(t('error_loading_ifc') || 'Fehler beim Laden des IFC-Modells', 'error');
      }
    );
  }, [url, addToast, t]);

  if (!model) return null;
  return (
    <group scale={[scale, scale, scale]}>
      <Center>
        <primitive
          object={model}
          onClick={(e: any) => {
            e.stopPropagation();
            if (e.object.geometry && e.faceIndex !== undefined) {
              onSelect(`ifc-element-${Math.floor(Math.random() * 1000)}`, {
                type: 'IFC Element',
                material: 'Unknown',
                cost: 'N/A',
                status: 'Imported',
              });
            }
          }}
        />
      </Center>
    </group>
  );
}

function GltfModel({ url, onClick }: { url: string; onClick: (e: any) => void }) {
  const gltf = useLoader(GLTFLoader, url, (loader: any) => {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    loader.setDRACOLoader(dracoLoader);
  });

  const { scene, scale } = React.useMemo(() => {
    if (!gltf || !gltf.scene) return { scene: null, scale: 1 };
    const cloned = gltf.scene.clone(true);
    cloned.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const calculatedScale = maxDim > 0 ? 8 / maxDim : 1;

    cloned.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material = child.material.map((m: any) => {
              const mat = m.clone();
              mat.side = THREE.DoubleSide;
              return mat;
            });
          } else {
            child.material = child.material.clone();
            child.material.side = THREE.DoubleSide;
          }
        }
      }
    });

    return { scene: cloned, scale: calculatedScale };
  }, [gltf]);

  if (!scene) return null;
  return (
    <group scale={[scale, scale, scale]}>
      <Center>
        <primitive object={scene} onClick={onClick} />
      </Center>
    </group>
  );
}

function ObjModel({ url, onClick }: { url: string; onClick: (e: any) => void }) {
  const obj = useLoader(OBJLoader, url);
  const { scene, scale } = React.useMemo(() => {
    if (!obj) return { scene: null, scale: 1 };
    const cloned = obj.clone(true);
    cloned.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const calculatedScale = maxDim > 0 ? 8 / maxDim : 1;

    cloned.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material = child.material.map((m: any) => {
              const mat = m.clone();
              mat.side = THREE.DoubleSide;
              return mat;
            });
          } else {
            child.material = child.material.clone();
            child.material.side = THREE.DoubleSide;
          }
        }
      }
    });

    return { scene: cloned, scale: calculatedScale };
  }, [obj]);

  if (!scene) return null;
  return (
    <group scale={[scale, scale, scale]}>
      <Center>
        <primitive object={scene} onClick={onClick} />
      </Center>
    </group>
  );
}

function DaeModel({ url, onClick }: { url: string; onClick: (e: any) => void }) {
  const collada = useLoader(ColladaLoader, url);
  const { scene, scale } = React.useMemo(() => {
    if (!collada || !collada.scene) return { scene: null, scale: 1 };
    const cloned = collada.scene.clone(true);
    cloned.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const calculatedScale = maxDim > 0 ? 8 / maxDim : 1;

    cloned.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material = child.material.map((m: any) => {
              const mat = m.clone();
              mat.side = THREE.DoubleSide;
              return mat;
            });
          } else {
            child.material = child.material.clone();
            child.material.side = THREE.DoubleSide;
          }
        }
      }
    });

    return { scene: cloned, scale: calculatedScale };
  }, [collada]);

  if (!scene) return null;
  return (
    <group scale={[scale, scale, scale]}>
      <Center>
        <primitive object={scene} onClick={onClick} />
      </Center>
    </group>
  );
}

function DwgModel({ onClick, t }: { onClick: (e: any) => void; t: (k: string) => string }) {
  return (
    <group onClick={onClick}>
      <DreiBox args={[10, 0.1, 8]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#1e293b" wireframe />
      </DreiBox>
      <Html position={[0, 1, 0]} center>
        <div className="bg-surface/95 backdrop-blur-md p-3 border border-border rounded-xl shadow-xl text-xs font-sans font-semibold text-text-primary text-center">
          DWG 2D/3D Vector Overlay Active
        </div>
      </Html>
    </group>
  );
}

function UploadedModelViewer({
  url,
  type,
  onSelect,
  measureMode,
  onMeasureClick,
  defectMode,
  onDefectClick,
  t,
}: any) {
  const tType = type?.toLowerCase() || '';

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (measureMode) {
      onMeasureClick(e.point);
    } else if (defectMode) {
      let worldNormal = new THREE.Vector3(0, 1, 0);
      if (e.face?.normal && e.object) {
        const normalMatrix = new THREE.Matrix3().getNormalMatrix(e.object.matrixWorld);
        worldNormal = e.face.normal.clone().applyMatrix3(normalMatrix).normalize();
      }
      onDefectClick(e.point, worldNormal);
    } else {
      onSelect(`uploaded-element-${Math.floor(Math.random() * 1000)}`, {
        type: `${type.toUpperCase()} Element`,
        material: 'Imported',
        cost: 'N/A',
        status: 'Loaded',
      });
    }
  };

  if (tType === 'ifc') return <IfcModel url={url} onSelect={onSelect} t={t} />;
  if (tType === 'obj') return <ObjModel url={url} onClick={handleClick} />;
  if (tType === 'gltf' || tType === 'glb') return <GltfModel url={url} onClick={handleClick} />;
  if (tType === 'dae') return <DaeModel url={url} onClick={handleClick} />;
  if (tType === 'dwg') return <DwgModel onClick={handleClick} t={t} />;
  return null;
}

function CameraRig({ isTouring }: { isTouring: boolean }) {
  const timeRef = useRef(0);
  useFrame((state, delta) => {
    if (isTouring) {
      timeRef.current += delta;
      const t = timeRef.current * 0.2;
      const x = Math.sin(t) * 25;
      const z = Math.cos(t) * 25;
      const y = 10 + Math.sin(t * 2) * 5;
      state.camera.position.lerp(new THREE.Vector3(x, y, z), delta * 2);
      state.camera.lookAt(0, 4, 0);
    }
  });
  return null;
}

function Building({
  layers,
  activeFloor,
  selectedId,
  onSelect,
  isExploded,
  measureMode,
  onMeasureClick,
  defectMode,
  onDefectClick,
}: any) {
  const isArchVisible = layers.find((l: any) => l.id === 'arch')?.visible;
  const isTgaVisible = layers.find((l: any) => l.id === 'tga')?.visible;
  const isStructVisible = layers.find((l: any) => l.id === 'struct')?.visible;
  const isFireVisible = layers.find((l: any) => l.id === 'fire')?.visible;

  const floors = [0, 1, 2];
  const floorRefs = useRef<(THREE.Group | null)[]>([]);

  useFrame((_state, delta) => {
    floors.forEach((floor, i) => {
      const ref = floorRefs.current[i];
      if (ref) {
        const targetY = floor * 4 + (isExploded ? floor * 5 : 0);
        ref.position.y = THREE.MathUtils.lerp(ref.position.y, targetY, delta * 5);
      }
    });
  });

  const handleClick = (e: any, id: string) => {
    e.stopPropagation();
    if (measureMode) {
      onMeasureClick(e.point);
    } else if (defectMode) {
      let worldNormal = new THREE.Vector3(0, 1, 0);
      if (e.face?.normal && e.object) {
        const normalMatrix = new THREE.Matrix3().getNormalMatrix(e.object.matrixWorld);
        worldNormal = e.face.normal.clone().applyMatrix3(normalMatrix).normalize();
      }
      onDefectClick(e.point, worldNormal);
    } else {
      onSelect(id);
    }
  };

  return (
    <group position={[0, -1, 0]}>
      {floors.map((floor, i) => {
        if (activeFloor !== null && activeFloor !== floor) return null;
        return (
          <group key={floor} ref={(el) => (floorRefs.current[i] = el)} position={[0, floor * 4, 0]}>
            {isStructVisible && (
              <DreiBox
                args={[12, 0.4, 12]}
                position={[0, 0.2, 0]}
                onClick={(e) => handleClick(e, `slab-${floor}`)}
              >
                <meshStandardMaterial
                  color={selectedId === `slab-${floor}` ? '#fcd34d' : '#f97316'}
                  transparent
                  opacity={0.8}
                />
              </DreiBox>
            )}
            {isStructVisible && (
              <group>
                {[[-5, -5], [5, -5], [-5, 5], [5, 5], [0, 0]].map((pos, idx) => (
                  <Cylinder
                    key={idx}
                    args={[0.3, 0.3, 3.6]}
                    position={[pos[0], 2.2, pos[1]]}
                    onClick={(e) => handleClick(e, `col-${floor}-${idx}`)}
                  >
                    <meshStandardMaterial color={selectedId === `col-${floor}-${idx}` ? '#fcd34d' : '#ea580c'} />
                  </Cylinder>
                ))}
              </group>
            )}
            {isArchVisible && (
              <group>
                <DreiBox args={[4, 3.6, 4]} position={[0, 2.2, 0]} onClick={(e) => handleClick(e, `core-${floor}`)}>
                  <meshStandardMaterial color={selectedId === `core-${floor}` ? '#fcd34d' : '#a1a1aa'} />
                </DreiBox>
                <DreiBox args={[11.6, 3.6, 0.1]} position={[0, 2.2, -5.8]} onClick={(e) => handleClick(e, `glass-n-${floor}`)}>
                  <meshStandardMaterial color="#38bdf8" transparent opacity={0.2} metalness={0.9} roughness={0.1} />
                </DreiBox>
                <DreiBox args={[11.6, 3.6, 0.1]} position={[0, 2.2, 5.8]} onClick={(e) => handleClick(e, `glass-s-${floor}`)}>
                  <meshStandardMaterial color="#38bdf8" transparent opacity={0.2} metalness={0.9} roughness={0.1} />
                </DreiBox>
                <DreiBox args={[0.1, 3.6, 11.6]} position={[-5.8, 2.2, 0]} onClick={(e) => handleClick(e, `glass-w-${floor}`)}>
                  <meshStandardMaterial color="#38bdf8" transparent opacity={0.2} metalness={0.9} roughness={0.1} />
                </DreiBox>
                <DreiBox args={[0.1, 3.6, 11.6]} position={[5.8, 2.2, 0]} onClick={(e) => handleClick(e, `glass-e-${floor}`)}>
                  <meshStandardMaterial color="#38bdf8" transparent opacity={0.2} metalness={0.9} roughness={0.1} />
                </DreiBox>
              </group>
            )}
            {isTgaVisible && (
              <group>
                <DreiBox args={[8, 0.4, 0.6]} position={[0, 3.6, 2]} onClick={(e) => handleClick(e, `hvac-main-${floor}`)}>
                  <meshStandardMaterial color={selectedId === `hvac-main-${floor}` ? '#fcd34d' : '#3b82f6'} metalness={0.8} roughness={0.2} />
                </DreiBox>
                <DreiBox args={[0.4, 0.4, 6]} position={[2, 3.6, -1]} onClick={(e) => handleClick(e, `hvac-branch-${floor}`)}>
                  <meshStandardMaterial color={selectedId === `hvac-branch-${floor}` ? '#fcd34d' : '#3b82f6'} metalness={0.8} roughness={0.2} />
                </DreiBox>
              </group>
            )}
            {isFireVisible && (
              <group>
                <Cylinder args={[0.1, 0.1, 0.3]} position={[0, 3.8, 0]} onClick={(e) => handleClick(e, `fire-${floor}`)}>
                  <meshStandardMaterial color={selectedId === `fire-${floor}` ? '#fcd34d' : '#ef4444'} />
                </Cylinder>
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
}

// ----------------------------------------------------------------------------
// ISOLATED THREE.JS CANVAS VIEWPORT (STATE ISOLATION VIA REACT.MEMO)
// ----------------------------------------------------------------------------

export interface DefectPinData {
  id: string;
  position: THREE.Vector3 | [number, number, number] | any;
  normal: THREE.Vector3 | [number, number, number] | any;
  description: string;
}

export interface BIMCanvasViewportProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  theme: 'dark' | 'light';
  isMobile: boolean;
  isTouring: boolean;
  cameraMode: 'rotate' | 'pan';
  activeModel: any;
  selectModel: (id: string) => void;
  layersInfo: any;
  activeFloor: number | null;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  isExploded: boolean;
  measureMode: boolean;
  measurePoints: THREE.Vector3[];
  handleMeasureClick: (pt: THREE.Vector3) => void;
  defectMode: boolean;
  defectPins: DefectPinData[];
  handleDefectClick: (pt: THREE.Vector3, normal: THREE.Vector3) => void;
  handleSelect: (id: string, details?: any) => void;
  t: (key: string) => string;
}

function BIMCanvasViewportComponent({
  canvasRef,
  theme,
  isMobile,
  isTouring,
  cameraMode,
  activeModel,
  selectModel,
  layersInfo,
  activeFloor,
  selectedId,
  setSelectedId,
  isExploded,
  measureMode,
  measurePoints,
  handleMeasureClick,
  defectMode,
  defectPins,
  handleDefectClick,
  handleSelect,
  t,
}: BIMCanvasViewportProps) {
  return (
    <Canvas
      camera={{ position: [15, 12, 15], fov: 50 }}
      gl={{
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance',
        antialias: true,
        failIfMajorPerformanceCaveat: false,
      }}
      ref={canvasRef}
      onPointerMissed={() => {
        if (!measureMode && !defectMode) setSelectedId(null);
      }}
    >
      {!isMobile && <SnapshotHelper />}
      <CameraRig isTouring={isTouring} />
      <color attach="background" args={[theme === 'dark' ? '#09090b' : '#f4f4f5']} />
      <ambientLight intensity={isMobile ? 1.0 : 0.5} />
      <directionalLight position={[10, 20, 5]} intensity={1.5} />

      <Suspense
        fallback={
          <Html center zIndexRange={[10, 0]}>
            <div className="flex flex-col items-center gap-2 p-3.5 bg-surface/90 backdrop-blur-md border border-border rounded-xl shadow-xl text-text-primary text-xs font-semibold">
              <Loader2 className="animate-spin text-accent-ai" size={24} />
              <span>3D-Modell wird geladen...</span>
            </div>
          </Html>
        }
      >
        {activeModel ? (
          <ModelErrorBoundary
            onError={(err) => console.error('3D Model Render Error:', err)}
            fallback={
              <Html center zIndexRange={[10, 0]}>
                <div className="flex flex-col items-center gap-2.5 p-5 bg-surface/95 backdrop-blur-md border border-red-500/40 rounded-2xl shadow-2xl text-center max-w-xs">
                  <AlertTriangle className="text-red-500" size={28} />
                  <div className="font-bold text-xs text-text-primary">3D-Modell konnte nicht gerendert werden</div>
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    Möglicherweise enthält die Datei ein inkompatibles Format oder Shader.
                  </p>
                  <button
                    onClick={() => selectModel('default')}
                    className="mt-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow transition-colors"
                  >
                    Standard-Modell anzeigen
                  </button>
                </div>
              </Html>
            }
          >
            <UploadedModelViewer
              url={activeModel.url}
              type={activeModel.type}
              onSelect={handleSelect}
              measureMode={measureMode}
              onMeasureClick={handleMeasureClick}
              defectMode={defectMode}
              onDefectClick={handleDefectClick}
              t={t}
            />
          </ModelErrorBoundary>
        ) : (
          <Building
            layers={layersInfo}
            activeFloor={activeFloor}
            selectedId={selectedId}
            onSelect={handleSelect}
            isExploded={isExploded}
            measureMode={measureMode}
            onMeasureClick={handleMeasureClick}
            defectMode={defectMode}
            onDefectClick={handleDefectClick}
          />
        )}

        {measurePoints.map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshBasicMaterial color="#fcd34d" />
          </mesh>
        ))}
        {measurePoints.length === 2 && (
          <>
            <Line points={[measurePoints[0], measurePoints[1]]} color="#fcd34d" lineWidth={3} />
            <Html position={measurePoints[0].clone().lerp(measurePoints[1], 0.5)} center zIndexRange={[10, 0]}>
              <div className="bg-surface text-text-primary px-3 py-1.5 rounded-lg border border-border font-sans font-bold text-xs whitespace-nowrap shadow-xl">
                {measurePoints[0].distanceTo(measurePoints[1]).toFixed(2)} m
              </div>
            </Html>
          </>
        )}

        {defectPins.map((pin: any, i: number) => {
          const quaternion = new THREE.Quaternion();
          const normVec = pin.normal instanceof THREE.Vector3
            ? pin.normal
            : Array.isArray(pin.normal)
            ? new THREE.Vector3(pin.normal[0] || 0, pin.normal[1] || 1, pin.normal[2] || 0)
            : new THREE.Vector3(0, 1, 0);
          quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normVec);
          return (
            <group key={pin.id || `pin-${i}`} position={pin.position} quaternion={quaternion}>
              <mesh position={[0, 0.25, 0]}>
                <coneGeometry args={[0.1, 0.5, 16]} />
                <meshStandardMaterial color="#ef4444" />
              </mesh>
              <mesh position={[0, 0.5, 0]}>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshStandardMaterial color="#ef4444" />
              </mesh>
              {!isMobile && (
                <Html position={[0, 0.8, 0]} center zIndexRange={[10, 0]}>
                  <div className="bg-red-500 text-white px-3 py-1.5 rounded-lg border border-red-600 font-sans text-xs whitespace-nowrap shadow-xl cursor-pointer hover:bg-red-600 transition-colors flex flex-col items-center">
                    <span className="font-bold">{t('defect') || 'Mangel'} #{i + 1}</span>
                    <span className="text-[10px] opacity-90">{pin.description}</span>
                  </div>
                </Html>
              )}
            </group>
          );
        })}

        {!isMobile && <Environment preset="city" />}
      </Suspense>

      <OrbitControls
        makeDefault
        target={activeModel ? [0, 0, 0] : [0, activeFloor !== null ? activeFloor * 4 : 4, 0]}
        enableDamping={!isMobile}
        dampingFactor={0.05}
        mouseButtons={{
          LEFT: cameraMode === 'rotate' ? THREE.MOUSE.ROTATE : THREE.MOUSE.PAN,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: cameraMode === 'rotate' ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE,
        }}
      />
      {!isMobile && (
        <Grid
          infiniteGrid
          fadeDistance={40}
          sectionColor={theme === 'dark' ? '#27272a' : '#d4d4d8'}
          cellColor={theme === 'dark' ? '#18181b' : '#e4e4e7'}
        />
      )}
    </Canvas>
  );
}

export const BIMCanvasViewport = React.memo(BIMCanvasViewportComponent);
