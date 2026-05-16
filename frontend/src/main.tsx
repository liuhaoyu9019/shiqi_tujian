import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { useUserStore } from '@/stores/userStore'
import { useBoxStore } from '@/stores/boxStore'
import './index.css'

// 应用启动时自动加载用户和系列数据
useUserStore.getState().loadUser(1)
useBoxStore.getState().loadSeries()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
