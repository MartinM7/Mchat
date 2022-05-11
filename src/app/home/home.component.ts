import { Component, OnInit } from '@angular/core';
import {AuthService} from "../services/auth.service";
import {ChatService} from "../services/chat.service";
import { Observable } from 'rxjs';
import {Chat} from "../services/chat.model";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public userChats$: Observable<Chat[]> | undefined;

  constructor(public auth: AuthService, public cs: ChatService) { }

  ngOnInit(): void {
    this.userChats$ = this.cs.getUserChats();
  }

}
