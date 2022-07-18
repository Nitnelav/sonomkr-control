import { EventEmitter, Injectable } from '@angular/core';
import { io, Socket } from "socket.io-client";

export interface LeqEvent {
  channel: number,
  data: Map<number, number>
}
export interface AudioEvent {
  channel: number,
  data: Float32Array
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  leq: EventEmitter<LeqEvent> = new EventEmitter<LeqEvent>();
  audio: EventEmitter<AudioEvent> = new EventEmitter<AudioEvent>();

  socket: Socket | null = null;
  audioSocket: Socket | null = null;

  url: string = "http://localhost:80"

  constructor() {
    this.connect();
  }

  public connect() {
    if (this.socket != null) {
      this.socket.disconnect();
    }
    if (this.audioSocket != null) {
      this.audioSocket.disconnect();
    }
    this.socket = io(this.url, {
      path: "/stream/"
    });
    this.audioSocket = io(this.url, {
      path: "/stream/audio"
    });

    this.socket.on("leq_ch1", (msg: string) => {
      let data = new Map<number, number>()
      msg.split(";").slice(1, -1).forEach(freqVal => {
        let d = freqVal.split(":")
        data.set(parseInt(d[0]), parseFloat(d[1]))
      })
      this.leq.emit({ channel: 1, data: data })
    })
    this.socket.on("leq_ch2", (msg: string) => {
      let data = new Map<number, number>()
      msg.split(";").slice(1, -1).forEach(freqVal => {
        let d = freqVal.split(":")
        data.set(parseInt(d[0]), parseFloat(d[1]))
      })
      this.leq.emit({ channel: 2, data: data })
    })
    this.socket.on("audio_ch1", (msg: Float32Array) => {
      this.audio.emit({ channel: 1, data: msg })
    })
  }

}
