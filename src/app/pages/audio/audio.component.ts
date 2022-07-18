import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AudioService } from 'src/app/services/audio.service';
import { SocketService } from 'src/app/services/socket.service';

@Component({
  selector: 'app-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.css']
})
export class AudioComponent implements OnInit {

  audioSubscription: Subscription | any = null;

  constructor(
    private audioService: AudioService
  ) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

  start() {
    this.audioService.start();
  }

}
