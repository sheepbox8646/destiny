'use client'

import { useEffect, useRef } from 'react'
import { Network } from 'vis-network'
import { DataSet } from 'vis-data'

interface NetworkGraphProps {
  data: {
    nodes: Array<{
      id: string
      label: string
      image: string
    }>
    edges: Array<{
      from: string
      to: string
      value: number
      title: string
      meetings: Array<{
        id: string
        met_at: string
        location: string | null
      }>
    }>
  }
  currentUserId: string
  onNodeClick: (nodeId: string) => void
  onEdgeClick?: (meetings: any[]) => void
}

export default function NetworkGraph({ 
  data, 
  currentUserId, 
  onNodeClick,
  onEdgeClick 
}: NetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const networkRef = useRef<Network | null>(null)

  useEffect(() => {
    if (!containerRef.current || !data) return

    // 创建数据集
    const nodes = new DataSet(data.nodes.map(node => ({
      id: node.id,
      label: node.label,
      image: node.image,
      shape: 'circularImage',
      size: node.id === currentUserId ? 40 : 30,
      borderWidth: node.id === currentUserId ? 3 : 1,
      borderColor: node.id === currentUserId ? '#4F46E5' : '#E5E7EB'
    })))

    // 创建边数据集，添加id属性
    const edges = new DataSet(data.edges.map((edge, index) => ({
      id: index.toString(),
      from: edge.from,
      to: edge.to,
      value: edge.value,
      title: edge.title,
      // 存储额外数据
      meetings: edge.meetings
    })))

    // 更新配置选项
    const options = {
      nodes: {
        font: {
          size: 14,
          color: '#374151'
        },
        borderWidth: 1,
        borderColor: '#E5E7EB',
        color: {
          border: '#E5E7EB',
          background: '#FFFFFF'
        }
      },
      edges: {
        width: 2,
        color: {
          color: '#9CA3AF',
          highlight: '#4F46E5'
        },
        smooth: {
          enabled: true,
          type: 'continuous',
          roundness: 0.5
        },
        selectionWidth: 3,
        scaling: {
          min: 1,
          max: 10,
          label: {
            enabled: true,
            min: 14,
            max: 24
          }
        },
        font: {
          size: 14,
          align: 'middle'
        }
      },
      physics: {
        stabilization: {
          iterations: 100
        },
        barnesHut: {
          gravitationalConstant: -2000,
          springConstant: 0.04,
          springLength: 200
        }
      },
      interaction: {
        hover: true,
        tooltipDelay: 200,
        multiselect: true,
        navigationButtons: true,
        keyboard: {
          enabled: true,
          bindToWindow: false
        }
      }
    }

    // 创建网络
    networkRef.current = new Network(
      containerRef.current,
      { nodes, edges },
      options
    )

    // 添加事件监听
    networkRef.current.on('click', function(params) {
      if (params.nodes.length > 0) {
        onNodeClick(params.nodes[0])
      } else if (params.edges.length > 0 && onEdgeClick) {
        const edge = edges.get(params.edges[0])
        const edgeData = data.edges.find(e => e.from === (edge as any).from && e.to === (edge as any).to)
        if (edgeData) {
          onEdgeClick(edgeData.meetings)
        }
      }
    })

    // 添加双击事件以聚焦节点
    networkRef.current.on('doubleClick', function(params) {
      if (params.nodes.length > 0) {
        networkRef.current?.focus(params.nodes[0], {
          scale: 1.2,
          animation: true
        })
      }
    })

    // 添加悬停事件
    networkRef.current.on('hoverNode', function(params) {
      containerRef.current!.style.cursor = 'pointer'
    })
    networkRef.current.on('blurNode', function(params) {
      containerRef.current!.style.cursor = 'default'
    })
    networkRef.current.on('hoverEdge', function(params) {
      containerRef.current!.style.cursor = 'pointer'
    })
    networkRef.current.on('blurEdge', function(params) {
      containerRef.current!.style.cursor = 'default'
    })

    // 清理函数
    return () => {
      if (networkRef.current) {
        networkRef.current.destroy()
        networkRef.current = null
      }
    }
  }, [data, currentUserId, onNodeClick, onEdgeClick])

  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">暂无关系网络数据</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
  )
} 