<script setup lang="ts">
import { onMounted, ref } from 'vue'

const pc = new RTCPeerConnection()
const localStream = ref<MediaStream | null>(null)
const isConnected = ref(false)

// 获取本地视频流
async function getLocalStream() {
  try {
    localStream.value = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    })
    const localVideo = document.getElementById('local') as HTMLVideoElement
    if (localVideo && localStream.value) {
      localVideo.srcObject = localStream.value
    }
  } catch (err) {
    console.error('获取本地媒体流失败:', err)
  }
}

// 创建offer
async function createOffer() {
  if (!pc || !localStream.value) return
  
  localStream.value.getTracks().forEach(track => {
    if (localStream.value) {
      pc.addTrack(track, localStream.value)
    }
  })

  try {
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    // 这里应该将offer发送给对方
    console.log('Offer:', JSON.stringify(offer))
  } catch (err) {
    console.error('创建offer失败:', err)
  }
}

// 处理远程answer
async function handleAnswer(answerSdp: string) {
  const answer = JSON.parse(answerSdp)
  if (!pc.currentRemoteDescription) {
    await pc.setRemoteDescription(answer)
  }
}

// 监听远程流
pc.ontrack = (event) => {
  const remoteVideo = document.getElementById('remote') as HTMLVideoElement
  if (remoteVideo) {
    remoteVideo.srcObject = event.streams[0]
  }
}

// 连接状态变化
pc.onconnectionstatechange = () => {
  isConnected.value = pc.connectionState === 'connected'
}

onMounted(() => {
  getLocalStream()
})
</script>

<template>
  <div class="container">
    <div class="video-container">
      <div class="video-wrapper">
        <video id="local" autoplay playsinline muted></video>
        <div class="video-label">本地视频</div>
      </div>
      <div class="video-wrapper">
        <video id="remote" autoplay playsinline></video>
        <div class="video-label">远程视频</div>
      </div>
    </div>
    <div class="controls">
      <button @click="createOffer" :disabled="isConnected">开始连接</button>
      <button @click="getLocalStream">重新获取摄像头</button>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.video-container {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.video-wrapper {
  flex: 1;
  position: relative;
}

video {
  width: 100%;
  background: #000;
  border-radius: 8px;
}

.video-label {
  position: absolute;
  bottom: 10px;
  left: 10px;
  color: white;
  background: rgba(0,0,0,0.5);
  padding: 4px 8px;
  border-radius: 4px;
}

.controls {
  display: flex;
  gap: 10px;
  justify-content: center;
}

button {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  background: #4CAF50;
  color: white;
  cursor: pointer;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background: #45a049;
}
</style>