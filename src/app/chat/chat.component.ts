import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {AuthService} from "../services/auth.service";
import {ChatService} from "../services/chat.service";
import {Observable} from "rxjs";
import {Message} from "../services/message.model";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  public chat$: Observable<Message[] | null> | undefined;
  chatId: string | null | undefined;
  newMsg = '';
  private loading = false;
  href = '';
  newAudio: Blob | undefined | null;
  recorder: MediaRecorder | undefined | null;
  imageUrl: string | null | undefined;
  imageFile: File | null | undefined;

  constructor(private route: ActivatedRoute, public auth: AuthService, public cs: ChatService, public sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.chatId = this.route.snapshot.paramMap.get('id')
    this.chat$ = this.cs.get(this.chatId)
    this.href = window.location.href
  }

  async submit() {

    if (!this.newMsg && !this.newAudio && !this.imageUrl) {
      return alert("You can't send a empty message!" )
    }

    this.loading = true
    console.log("Before", this.newMsg, this.imageUrl, this.imageFile)
    await this.cs.addMessage(this.chatId, this.newMsg, this.newAudio, this.imageFile)
    this.newAudio = null
    this.loading = false
    this.newMsg = ''
    this.imageUrl = null
    this.imageFile = null
    this.scrollBottom()
    console.log("After", this.newMsg, this.imageUrl, this.imageFile)
  }

  trackByCreated(i: any, msg: { createdAt: any; }) {
    return msg.createdAt;
  }

  private scrollBottom() {
    setTimeout(() => window.scrollTo(0, document.body.scrollHeight ), 500)
  }

  newAudioURL() {
    return this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(this.newAudio as Blob ))
  }

  async record() {
    this.newAudio = null

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      })

      const options = { mimeType: "audio/webm" }
      const recordedChunks: BlobPart[] | undefined = []
      this.recorder = new MediaRecorder(stream, options)

      this.recorder.addEventListener("dataavailable", ev => {
        if (ev.data.size > 0) {
          recordedChunks.push(ev.data)
        }
      })

      this.recorder.addEventListener("stop", () => {
        this.newAudio = new Blob(recordedChunks)
      })

      this.recorder.start()
    } catch (err) {
      alert('An Audio recording device could not be found!')
    }

  }

  stop() {
    this.recorder?.stop()
    this.recorder = null
  }


  onselectImage($event: any) {
    const file: File = $event.target.files[0]
    if (file) {
      this.imageFile = file
      console.log(file.name, file.type)  // testing
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        this.imageUrl = reader.result as string
      }
    }
  }

}
