import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { SocketService, AudioEvent } from './socket.service';

const WAIT_FIRST_BLOCKS = 4

@Injectable({
  providedIn: 'root'
})
export class AudioService {

  public audioSubscription: Subscription | any = null;
  private cursor = 0;
  private audioContext: any;
  private playbackBuffer: Float32Array = new Float32Array();
  private headParam: any;
  audioWorkletNode: any;
  blocksCounter: number = 0
  started = false
  analyser: any
  constructor(
    private socketService: SocketService,
  ) {
  }

  async start() {
    if (!this.started) {
      this.audioContext = new AudioContext();
      
      try {
        await this.audioContext.audioWorklet.addModule('assets/audio.processor.js')
      } catch (error) {
        console.log("error : ", error)
        return
      } 
      this.audioWorkletNode = new AudioWorkletNode(this.audioContext, 'audio-processor')
      this.audioWorkletNode.port.onmessage = (e: any) => {
        if (e.data.eventType === 'buffer') {
          this.playbackBuffer = new Float32Array(e.data.buffer);
        }
      }
      this.headParam = this.audioWorkletNode.parameters.get("head");

      this.audioWorkletNode.connect(this.audioContext.destination);

      this.audioSubscription = this.socketService.audio.subscribe((e: AudioEvent) => {
        let channel = e.channel;
        let data: Float32Array = new Float32Array(e.data);
        if (channel == 1) {
          this.playbackBuffer.set(data, this.cursor)
          this.cursor = this.cursor + data.length;
          this.cursor = this.cursor % (this.playbackBuffer.length);
          if (this.blocksCounter < WAIT_FIRST_BLOCKS) {
            this.blocksCounter += 1;
          }
          else {
            this.headParam.setValueAtTime(this.cursor, this.audioContext.currentTime);
          }
        }
      })

      this.audioWorkletNode.start

      this.started = true
    }
  }

  // this.audioSubscription.unsubscribe()
}
