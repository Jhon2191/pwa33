import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'src/environments/environment';
import jwt_decode from 'jwt-decode';

const CIU_URL = environment.CIU_URL;
const RRHH_URL = environment.RRHH_URL;

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  constructor(
    private http: HttpClient,
    private jwtHelper: JwtHelperService
  ) { }

  handleError(error: HttpErrorResponse): any {
    return throwError(error);
  }

  /**
   * @author Daniel Martinez
   * @createdate 2021-01-27
   * Servicio que se consume en ciu para el logueo y obtencion del login
   * @param user formData con el usuario y el password del usuario
  */
  Authentification(user: FormData): Observable<any> {
    return this.http.post<any>(`${CIU_URL}auth/login`, user)
      .pipe(
        catchError(this.handleError)
      );
  }
  /**
   * @author Daniel Martinez
   * @createdate 2021-01-27
   * Servicio que obtiene los datos basicos del usuario del local storage
  */
  getUser(): any {
    return this.decryptToken();
  }
  /**
   * @author Daniel Martinez
   * @createdate 2021-01-27
   * Servicio que verifica si el token esta valido o no
  */
  verifyTokent(): boolean {
    const token = JSON.parse(localStorage.getItem('user'));
    return !this.jwtHelper.isTokenExpired(token.access_token);
  }
  /**
   * @author Daniel Martinez
   * @createdate 2021-03-02
   * Servicio que refresca el token
  */
  refreshToken(): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: 'Bearer' + this.getToken(),
      }),
    };
    return this.http.post<any>(`${CIU_URL}auth/refresh`, httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }
  /**
   * @author Daniel Martinez
   * @createdate 2021-02-26
   * Servicio que se consume en ciu para verificar la contraseña
   * @param user formData con el usuario y el password del usuario
  */
  passwordVerify(user: FormData): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: 'Bearer' + this.getToken(),
      }),
    };

    return this.http.post<any>(`${CIU_URL}auth/validatePassword`, user, httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }
  /**
   * @author Daniel Martinez
   * @createdate 2021-02-26
   * Servicio que se consume en ciu para verificar la contraseña, este servicio no requiere un token
   * @param user formData con el usuario y el password del usuario
  */
  passwordVerifyLogin(user: FormData): Observable<any> {

    return this.http.post<any>(`${CIU_URL}auth/validatePasswordLogin`, user)
      .pipe(
        catchError(this.handleError)
      );
  }
  /**
   * @author Daniel Martinez
   * @createdate 2021-02-01
   * Servicio que inhabilita el token y genera el logOut
  */
  logOut(): Observable<any> {
    return this.http.get<any>(`${CIU_URL}auth/logout`)
      .pipe(
        catchError(this.handleError)
      );
  }
  /**
   * @author Daniel Martinez
   * @createdate 2021-07-01
   * Servicio que devuelve el token jwt desencriptado para poder acceder a su informacion sin tener que usar el localStorage
  */
  decryptToken(): any {
    var token = this.getToken();
    if (token === null) {
      return null;
    } else {
      var decoded = jwt_decode(token);
      return decoded;
    }
  }

  getToken(): any {
    var token = JSON.parse(localStorage.getItem('user'));
    if (token === null) {
      return null;
    } else {
      return token.access_token;
    }
  }
  /**
   * @author Carlos Nieto
   * @createdate 2021-12-10
   * Servicio valida el email, en caso de ser correcto envia un email al usuario con un link y un token
   * @param email formData con el email del usuario
  */
  validateEmail(email: FormData): Observable<any> {
    return this.http.post<any>(`${CIU_URL}auth/validateEmail`, email)
      .pipe(
        catchError(this.handleError)
      );
  }
  /**
    * @author Carlos Nieto
    * @createdate 2022-02-14
    * Servicio valida el numero  de documento,
    *  en caso de ser correcto envia un email al usuario con su nombre de usuario
    * @param document formData con el email del usuario
  */
  SendEmailWithUserName(document: FormData): Observable<any> {

    return this.http.post<any>(`${CIU_URL}auth/rememberUser`, document)
      .pipe(
        catchError(this.handleError)
      );
  }
  /**
   * @author Carlos Nieto
   * @createdate 2021-12-10
   * Servicio que permite cambiar la contraseña por medio de un token de aautorizcion enviado al correo
   * @param form formData con el email del usuario
  */
  changePasswordAuth(form: FormData): Observable<any> {
    return this.http.post<any>(`${CIU_URL}auth/validateTokenUpdatePassword`, form)
      .pipe(
        catchError(this.handleError)
      );
  }
  /**
   * @author Carlos Nieto
   * @createdate 2022-02-16
   * Servicio que envia el  correo con el codigo para el doble login
   * @param form formData con el rrhh_id y el correo del usuario que crea la solicitud
  */
  sendEmailToDobbleAuth(form): Observable<any> {
    return this.http.post<any>(`${CIU_URL}auth/sendEmailToDobbleAuth`, form)
      .pipe(
        catchError(this.handleError)
      );
  }
  /**
   * @author Carlos Nieto
   * @createdate 2022-02-16
   * Servicio que envia el sms con el codigo para el doble login
   * @param form formData con el rrhh_id y el numero del usuario que crea la solicitud
  */
  sendSmsToDobbleAuth(form): Observable<any> {
    return this.http.post<any>(`${CIU_URL}auth/sendSmsToDobbleAuth`, form)
      .pipe(
        catchError(this.handleError)
      );
  }
  /**
  * @author Juan Carlos Alonso
  * @createdate 29-05-2024
  * Servicio que retorna la lista de preguntas de seguridad
  */
  getSecurityQuestionsList() {
    return this.http.get<any>(`${CIU_URL}SecurityQuestions`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * @author Juan Carlos Alonso
   * @createdate 29-05-2024
   * Servicio que envía y almacena las preguntas de seguridad
   */
  saveSecurityQuestions(data: any) {
    return this.http.post<any>(`${CIU_URL}SecurityQuestions/save`, data)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * @author Fabian Duran
   * @createdate 2024-07-29
   * Metodo que verifica si el usuario tiene pendiente documentos por firmar.
   * @param document Documento del usuario.
  */
  verifyUserDescount(document: number): Observable<any> {
    return this.http.get<any>(`${RRHH_URL}descuentos/checkuser/${document}`)
      .pipe(
        catchError(this.handleError)
      );
  }
  /**
   * @author Fabian Duran
   * @createdate 2024-07-29
   * Metodo que obtiene el documento a firmar.
   * @param document Documento del usuario.
  */
  getDocumentToVerifyDescount(document: number): Observable<any> {
    return this.http.get(`${RRHH_URL}descuentos/getdocument/${document}`, { responseType: 'blob' as 'json' })
      .pipe(
        catchError(this.handleError)
      );
  }
  /**
   * @author Fabian Duran
   * @createdate 2024-07-29
   * Metodo que guarda la firma en el servidor.
  */
  saveSignatureDocument(formData: FormData): Observable<any> {
    return this.http.post<any>(`${RRHH_URL}descuentos/firmdocument`, formData)
      .pipe(
        catchError(this.handleError)
      );
  }
}
