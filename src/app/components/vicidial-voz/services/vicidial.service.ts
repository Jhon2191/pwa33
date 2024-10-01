import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';
import { delay } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VicidialService {
  private server = environment.VICIDIAL_URL;
  private serverCIU = environment.CIU_URL;
  user;

  private phoneNumber = null;

  constructor(private http: HttpClient, private activeRoute: ActivatedRoute, private authService: AuthService) {
    this.user = this.authService.getUser();
  }

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  private statusCiuSubject = new Subject();
  statusCiuObservable = this.statusCiuSubject.asObservable();

  private pauseActiveSubject = new Subject<boolean>();
  pauseActiveObservable = this.pauseActiveSubject.asObservable();

  private pauseStatusSubject = new Subject<string>();
  vicidialStatusObservable = this.pauseStatusSubject.asObservable();

  private callResponseSubject = new Subject<any>();
  callResponseObservable = this.callResponseSubject.asObservable();

  private callManualResponseSubject = new Subject<any>();
  callResponseManualObservable = this.callManualResponseSubject.asObservable();

  private callHangUpSubject = new Subject<any>();
  callHangUpObservable = this.callHangUpSubject.asObservable();

  private statusRpaSubject = new Subject();
  statusRPAObservable = this.statusRpaSubject.asObservable();

  setStatusRPA(status, uid) {
    console.log(uid);
    let data = {
      status,
      uid
    }
    this.statusRpaSubject.next(data);
  }

  setStatusCiu(value: string, key?) {
    this.statusCiuSubject.next([value, key]);
  }

  setCallResponse(value) {
    this.callResponseSubject.next(value);
  }

  setCallManualResponse(value) {
    this.callManualResponseSubject.next(value);
  }

  setHangUp(value) {
    this.callHangUpSubject.next(value);
  }

  setPause(value: boolean) {
    this.pauseActiveSubject.next(value);
  }
  setPauseStatus(status: string) {
    this.pauseStatusSubject.next(status);
  }

  getVicidialConfigs(entries) {
    entries.rrhh_id = this.user.rrhh_id;
    const params = new HttpParams({ fromObject: entries });
    return this.http.post(`${this.server}auth/getConfigs`, params);
  }

  login(entries) {
    entries.rrhh_id = this.user.rrhh_id;
    const params = new HttpParams({ fromObject: entries });
    return this.http.post(`${this.server}auth/login`, params);
  }

  logout(entries) {
    entries.rrhh_id = this.user.rrhh_id;
    const params = new HttpParams({ fromObject: entries });
    return this.http.post(`${this.server}auth/logout`, params);
  }

  extendCheck(entries) {
    entries.rrhh_id = this.user.rrhh_id;
    const params = new HttpParams({ fromObject: entries });
    return this.http.post(`${this.server}config/extend/check`, params);
  }

  selectGroup(entries) {
    entries.rrhh_id = this.user.rrhh_id;
    const params = new HttpParams({ fromObject: entries });
    return this.http.post(`${this.server}select/group`, params);
  }

  setAgentStatus(entries) {
    entries.rrhh_id = this.user.rrhh_id;
    const params = new HttpParams({ fromObject: entries });
    return this.http.post(`${this.server}vdad/status`, params);
  }

  incomming(entries) {
    entries.rrhh_id = this.user.rrhh_id;
    const params = new HttpParams({ fromObject: entries });
    return this.http.post(`${this.server}incomming`, params);
  }

  manDialCall(entries) {
    entries.rrhh_id = this.user.rrhh_id;
    const params = new HttpParams({ fromObject: entries });
    return this.http.post(`${this.server}manual/dial/call`, params);
  }

  monitorConf(entries) {
    entries.rrhh_id = this.user.rrhh_id;
    const params = new HttpParams({ fromObject: entries });
    return this.http.post(`${this.server}manual/dial/call/monitorconf`, params);
  }

  joinToCall(entries) {
    entries.rrhh_id = this.user.rrhh_id;
    const params = new HttpParams({ fromObject: entries });
    return this.http.post(`${this.server}jointocall`, params);
  }

  recheckInconming(entries) {
    entries.rrhh_id = this.user.rrhh_id;
    const params = new HttpParams({ fromObject: entries });
    return this.http.post(`${this.server}recheckincoming`, params);
  }

  manDialCallLookUp(entries) {
    entries.rrhh_id = this.user.rrhh_id;
    const params = new HttpParams({ fromObject: entries });
    return this.http.post(`${this.server}manual/dial/call/look`, params);
  }

  manDiaLlogCallStart(entries) {
    entries.rrhh_id = this.user.rrhh_id;
    const params = new HttpParams({ fromObject: entries });
    return this.http.post(`${this.server}manual/dial/call/star`, params);
  }

  manDiaLlogCallEnd(entries) {
    entries.rrhh_id = this.user.rrhh_id;
    const params = new HttpParams({ fromObject: entries });
    return this.http.post(`${this.server}manual/dial/call/end`, params);
  }

  hangUp(entries) {
    entries.rrhh_id = this.user.rrhh_id;
    const params = new HttpParams({ fromObject: entries });
    return this.http.post(`${this.server}hangup/dial`, params);
  }

  manDiaLlogCaLL(entries) {
    entries.rrhh_id = this.user.rrhh_id;
    const params = new HttpParams({ fromObject: entries });
    return this.http.post(`${this.server}hangup/diallogcall`, params);
  }

  transfer(entries) {
    entries.rrhh_id = this.user.rrhh_id;
    const params = new HttpParams({ fromObject: entries });
    return this.http.post(`${this.server}transfer/dial`, params);
  }

  parking(entries) {
    entries.rrhh_id = this.user.rrhh_id;
    const params = new HttpParams({ fromObject: entries });
    return this.http.post(`${this.server}dial/parking`, params);
  }

  parkingRecovery(entries) {
    entries.rrhh_id = this.user.rrhh_id;
    const params = new HttpParams({ fromObject: entries });
    return this.http.post(`${this.server}dial/parking/recovery`, params);
  }

  updateLead(entries) {
    entries.rrhh_id = this.user.rrhh_id;
    const params = new HttpParams({ fromObject: entries });
    return this.http.post(`${this.server}update/lead`, params);
  }

  setPauseCode(entries) {
    entries.rrhh_id = this.user.rrhh_id;
    const params = new HttpParams({ fromObject: entries });
    return this.http.post(`${this.server}puaseCode`, params);
  }

  changeStatus(argCiu, typeStatus) {
    const varsVicidial = JSON.parse(localStorage.getItem('varsVicidial'));
    const params = {
      server_vicidial: varsVicidial.server_vicidial,
      server_ip: varsVicidial.server_ip,
      session_name: varsVicidial.session_name,
      ACTION: typeStatus == 'pause' ? 'VDADpause' : 'VDADready',
      user: varsVicidial.user,
      pass: varsVicidial.pass,
      stage: typeStatus == 'pause' ? 'PAUSED' : 'READY',
      agent_log_id: varsVicidial.agent_log_id,
      agent_log: '',
      wrapup: '',
      campaign: varsVicidial.campaign,
      dial_method: 'RATIO',
      comments: '',
      qm_extension: varsVicidial.extension
    };
    this.setAgentStatus(params).subscribe((resp: any) => { });
  }

  logoutFromCIU() {
    const varsVicidial = JSON.parse(localStorage.getItem('varsVicidial'));
    const params = {
      server_vicidial: varsVicidial.server_vicidial,
      server_ip: varsVicidial.server_ip,
      session_name: varsVicidial.session_name,
      ACTION: 'userLOGout',
      format: 'text',
      user: varsVicidial.user,
      pass: varsVicidial.pass,
      orig_pass: varsVicidial.pass,
      campaign: varsVicidial.campaign,
      conf_exten: varsVicidial.session_id,
      extension: varsVicidial.extension,
      protocol: 'SIP',
      agent_log_id: varsVicidial.agent_log_id,
      no_delete_sessions: 1,
      phone_ip: '',
      enable_sipsak_messages: '0',
      LogouTKicKAlL: '1',
      ext_context: 'default',
      qm_extension: varsVicidial.extension,
      stage: 'NORMAL',
      pause_trigger: '',
      dial_method: 'RATIO'
    };

    this.logout(params).subscribe((resp: any) => { });
  }
  post(endpoint, entries) {
    entries.rrhh_id = this.user.rrhh_id;
    const params = new HttpParams({ fromObject: entries });
    return this.http.post(`${this.server}${endpoint}`, params);
  }

  getRealTimeReports(entries) {
    entries.rrhhId = this.user.rrhh_id;
    const params = new HttpParams({ fromObject: entries });
    return this.http.get(`${this.server}report/realtime`, { params });
  }

  setPhoneNumber(phone) {
    this.phoneNumber = phone;
  }

  getPhoneNumber() {
    return this.phoneNumber;
  }

  registerPause(entries) {
    entries.rrhh_id = this.user.rrhh_id;
    const params = new HttpParams({ fromObject: entries });
    return this.http.post(`${this.serverCIU}vicidial/logVicidial`, params);
  }

  updateDispo(entries) {
    entries.rrhh_id = this.user.rrhh_id;
    const params = new HttpParams({ fromObject: entries });
    return this.http.post(`${this.server}update/dispo`, params);
  }

  vdRelogin(entries) {
    entries.rrhh_id = this.user.rrhh_id;
    const params = new HttpParams({ fromObject: entries });
    return this.http.post(`${this.server}vdrelogin`, params);
  }
}
