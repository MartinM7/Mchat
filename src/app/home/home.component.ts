import { Component, OnInit } from '@angular/core';
import {AuthService} from "../services/auth.service";
import {User} from "../services/user.model";
import {ChatService} from "../services/chat.service";
import { DocumentChange, DocumentData } from 'firebase/firestore';
import { Observable } from 'rxjs';
import {Chat} from "../services/chat.model";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  // public prom: User | null | undefined; // for testing

  public userChats$: Observable<Chat[]> | undefined;



  constructor(public auth: AuthService, public cs: ChatService) { }

  ngOnInit(): void {
    this.userChats$ = this.cs.getUserChats();
  }

  // async gU() { // for testing
  //   console.log("button get user")
  //   this.prom = await this.auth.getUser();
  //   console.log(this.prom)
  // }
}
