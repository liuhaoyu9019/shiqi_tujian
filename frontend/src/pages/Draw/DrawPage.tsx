import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float } from '@react-three/drei'
import * as THREE from 'three'
import { useBoxStore } from '@/stores/boxStore'
import { useDrawStore } from '@/stores/drawStore'
import { useUserStore } from '@/stores/userStore'
import { RARITY_CONFIG } from '@/types'
import DrawModal from '@/components/DrawResult/DrawModal'

// 3D盲盒模型（程序化生成的封闭盒子）
function BoxModel({ color = '#4F6EF7', isOpening = false }: { color?: string; isOpening?: boolean }) {
  const groupRef = useRef<THREE.Group>(null!)

  useFrame((_, delta) => {
    if (!isOpening) {
      groupRef.current.rotation.y += delta * 0.5
    }
    // 开盒时加速旋转
    if (isOpening) {
      groupRef.current.rotation.y += delta * 3
      groupRef.current.rotation.x += delta * 1.5
    }
  })

  return (
    <group ref={groupRef}>
      {/* 主体 */}
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
      </mesh>
      {/* 盖子 */}
      <mesh position={[0, isOpening ? 1.8 : 1.0, 0]}>
        <boxGeometry args={[2.1, 0.15, 2.1]} />
        <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* 问号标记 */}
      <mesh position={[0, 0, 1.01]}>
        <torusGeometry args={[0.3, 0.05, 16, 32]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
      </mesh>
      {/* 粒子环绕 */}
      <Float speed={2} rotationIntensity={0} floatIntensity={0.3}>
        <mesh position={[1.2, 0, 1.2]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={1} />
        </mesh>
      </Float>
      <Float speed={3} rotationIntensity={0} floatIntensity={0.4}>
        <mesh position={[-1.2, 0.5, -1.2]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#7C5CFC" emissive="#7C5CFC" emissiveIntensity={1} />
        </mesh>
      </Float>
    </group>
  )
}

export default function DrawPage() {
  const { seriesId } = useParams<{ seriesId: string }>()
  const navigate = useNavigate()
  const { series, loading, loadSeries } = useBoxStore()
  const current = series.find((s) => s.id === Number(seriesId))
  const { isOpening, lastResult, executeDraw, setLastResult } = useDrawStore()
  const user = useUserStore((s) => s.user)
  const deductBalance = useUserStore((s) => s.deductBalance)
  const [showResult, setShowResult] = useState(false)
  const [batchCount, setBatchCount] = useState(1)
  const [drawError, setDrawError] = useState<string | null>(null)

  useEffect(() => { if (series.length === 0) loadSeries() }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="skeleton w-48 h-8" /></div>
  }
  if (!current) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-text-disabled">系列不存在</p>
      </div>
    )
  }

  const price = current.price * batchCount
  const canAfford = (user?.balance ?? 0) >= price

  const handleDraw = async () => {
    if (!canAfford || isOpening || !user) return
    setDrawError(null)
    deductBalance(price)
    try {
      for (let i = 0; i < batchCount; i++) {
        await executeDraw(user.id, current.id)
      }
      setShowResult(true)
    } catch (e) {
      setDrawError((e as Error).message || '开盒失败')
      useUserStore.getState().addBalance(price)
    }
  }

  const handleDrawAgain = () => {
    setShowResult(false)
    setLastResult(null)
    setDrawError(null)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* 返回 */}
      <button
        onClick={() => navigate('/')}
        className="text-text-secondary hover:text-text-primary transition-colors mb-4 flex items-center gap-1 text-sm"
      >
        ← 返回商城
      </button>

      {/* 3D渲染区域 */}
      <div className="bg-card rounded-card shadow-card overflow-hidden mb-6">
        <div className="h-80 sm:h-96 relative">
          <Canvas camera={{ position: [0, 1, 5], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-5, 5, -5]} intensity={0.5} color="#7C5CFC" />
            <spotLight position={[0, 8, 0]} intensity={2} angle={0.6} penumbra={0.5} color="#FFD700" />
            <BoxModel color={current.id % 2 === 0 ? '#4F6EF7' : '#7C5CFC'} isOpening={isOpening} />
            <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.3} />
          </Canvas>
          {isOpening && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[2px]">
              <div className="text-white text-center">
                <div className="text-3xl animate-pulse mb-2">✨</div>
                <p className="text-sm font-medium">正在开启...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 信息区 */}
      <div className="bg-card rounded-card shadow-card p-6 space-y-5">
        <div className="text-center">
          <h1 className="text-xl font-bold text-text-primary">{current.name}</h1>
          <p className="text-sm text-text-secondary mt-1">{current.description}</p>
        </div>

        {/* 连抽选择 */}
        <div className="flex items-center justify-center gap-2">
          {[1, 5, 10].map((n) => (
            <button
              key={n}
              onClick={() => setBatchCount(n)}
              disabled={isOpening}
              className={`px-4 py-1.5 rounded-btn text-sm transition-colors ${
                batchCount === n
                  ? 'bg-primary text-white'
                  : 'bg-bg text-text-secondary hover:text-text-primary'
              }`}
            >
              {n === 1 ? '单抽' : `${n}连抽`}
            </button>
          ))}
        </div>

        {/* 价格和操作 */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg font-bold text-primary font-mono">
              ¥{(price / 100).toFixed(1)}
            </span>
            <span className="text-xs text-text-disabled">
              余额 ¥{((user?.balance ?? 0) / 100).toFixed(2)}
            </span>
          </div>
          <button
            onClick={handleDraw}
            disabled={!canAfford || isOpening}
            className={`w-full max-w-xs py-3 rounded-btn text-base font-medium text-white transition-all ${
              canAfford && !isOpening
                ? 'bg-gradient-to-r from-primary to-accent btn-press hover:opacity-90'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {isOpening ? '开启中...' : !canAfford ? '余额不足' : `✨ 立即开盒`}
          </button>
        </div>

        {/* 可掉落预览 */}
        <div>
          <p className="text-xs text-text-disabled mb-2 text-center">可能掉落</p>
          <div className="flex justify-center gap-2">
            {(['N', 'R', 'SR', 'SSR'] as const).map((r) => (
              <span
                key={r}
                className="text-xs px-2 py-0.5 rounded-tag"
                style={{ color: RARITY_CONFIG[r].color, background: RARITY_CONFIG[r].bg }}
              >
                {r}
              </span>
            ))}
            <span className="text-xs text-text-disabled px-2 py-0.5 rounded-tag bg-red-50 text-red-400">
              UR?
            </span>
          </div>
        </div>
      </div>

      {/* 开盒结果弹窗 */}
      {showResult && lastResult && (
        <DrawModal
          record={lastResult}
          onClose={() => setShowResult(false)}
          onDrawAgain={handleDrawAgain}
        />
      )}
    </div>
  )
}
