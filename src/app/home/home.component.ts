import { Component, OnInit } from '@angular/core';
import {AuthService} from "../services/auth.service";
import {User} from "../services/user.model";
import {ChatService} from "../services/chat.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public prom: User | null | undefined;


  constructor(public auth: AuthService, public cs: ChatService) { }

  ngOnInit(): void {
  }

  async gU() {
    console.log("button get user")
    this.prom = await this.auth.getUser();
    console.log(this.prom)
  }
}
