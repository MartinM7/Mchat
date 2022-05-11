import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {AuthService} from "../services/auth.service";
import {ChatService} from "../services/chat.service";
import {Observable} from "rxjs";
import {Message} from "../services/message.model";

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

  constructor(private route: ActivatedRoute, public auth: AuthService, public cs: ChatService) { }

  ngOnInit(): void {
    this.chatId = this.route.snapshot.paramMap.get('id')
    this.chat$ = this.cs.get(this.chatId)
    this.href = window.location.href
  }

  async submit() {
    this.loading = true
    await this.cs.addMessage(this.chatId, this.newMsg)
    this.loading = false
    this.newMsg = ''
    this.scrollBottom()
  }

  trackByCreated(i: any, msg: { createdAt: any; }) {
    return msg.createdAt;
  }

  private scrollBottom() {
    setTimeout(() => window.scrollTo(0, document.body.scrollHeight ), 500)
  }
}
