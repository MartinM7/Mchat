import { Injectable } from '@angular/core';
import {firstValueFrom, Observable, of, switchMap} from "rxjs";
import {Router} from "@angular/router";
import {
  Auth,
  getAdditionalUserInfo,
  GoogleAuthProvider,
  signInWithPopup, signOut,
  user
} from "@angular/fire/auth";
import {
  doc,
  docData,
  Firestore,
  setDoc
} from "@angular/fire/firestore";
import {User} from "./user.model";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<User | null>;


  constructor(
    private afAuth: Auth,
    private afs: Firestore,
    private router: Router
  ) {

  this.user$ = user(afAuth).pipe(
    switchMap((user) => user
        ? docData(doc(this.afs, 'users', user.uid)) as Observable<User>
        : of(null)
    )
  );


  }
  async googleSigIn() {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(this.afAuth, provider);
      const user = getAdditionalUserInfo(credential);
      if (user) {
        console.log(credential.user.email)
      }
      return this.updateUserData(credential.user as User)
  }

  private updateUserData({uid, email, photoURL, displayName}: User) {
      const documentRef = doc(this.afs, 'users', uid)

      const data = {
        uid,
        email,
        displayName,
        photoURL
       };

      return setDoc(documentRef, data, { merge: true})
  }

  getUser() {
      return firstValueFrom(this.user$ as Observable<User>)
  }

  async signUserOut() {
      await signOut(this.afAuth)
      return this.router.navigate(['/'])
  }
}
