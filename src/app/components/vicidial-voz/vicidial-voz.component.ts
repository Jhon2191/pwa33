import {
  Component,
  OnInit,
  EventEmitter,
  Output,
  OnChanges,
  Input,
} from '@angular/core';
import { DestroyComponentService } from 'src/app/services/destroy-component.service';
import { VicidialService } from './services/vicidial.service';
import { interval } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { FormsRequestService } from 'src/app/services/forms-request.service';
import { AuthService } from 'src/app/services/auth.service';
import { AlertsService } from 'src/app/services/alerts.service';
import { VicidialWalletService } from './services/vicidial-wallet.service';
import { CrudService } from 'src/app/services/crud.service';
import { environment } from 'src/environments/environment';
// import { fadeInOnEnterAnimation, fadeOutAnimation } from 'angular-animations';

const { VOICEBOT_URL } = environment;

@Component({
  selector: 'app-vicidial-voz',
  templateUrl: './vicidial-voz.component.html',
  styleUrls: ['./vicidial-voz.component.sass'],
  animations: [
    // fadeInOnEnterAnimation(),
    // fadeOutAnimation()
  ]
})
export class VicidialVozComponent implements OnInit {
  constructor(
    private vicidialService: VicidialService,
    private destroyService: DestroyComponentService,
    private activatedRoute: ActivatedRoute,
    private notificationService: AlertsService,
    private formsRequestService: FormsRequestService,
    private authService: AuthService,
    public route: ActivatedRoute,
    private alertsService: AlertsService,
    private vicidialWalletService: VicidialWalletService,
    private crudService: CrudService
  ) {
    this.route.paramMap.subscribe((params) => {
      this.formId = params.get('id');
    });
    // this.rrhhId = this.authService.getUser().rrhh_id;

    // this.campaignId = this.authService.getUser().rrhh.campaign_id;
  }
  campaignSelected = false;
  optionsIVR: string[] = [];
  subscribeIntervalXfer = null;
  subscribeIntervalConnected = null;
  subscribeIntervalPause = null;
  subscribeIntervalPauseXfer = null;
  formId;
  rrhhId;
  isTransfer = false;
  phone2: number = null;
  voz = true;
  vozButton = true;
  @Output() viewPhoneButton: EventEmitter<boolean> =
    new EventEmitter<boolean>();
  @Output() callResponse: EventEmitter<any> = new EventEmitter<any>();
  viewPhoneState = true;
  stateMute = false;
  vozState = 'register';
  callingXfer = false;
  telephone: number | string | null = null;
  callPause = false;
  callXferPause = false;
  dtmfVar: number;
  myVars: any = null;
  configCheckResponse;
  groupSelected = null;
  inCommingResponse = null;
  callActive = false;
  manualDialCallResponse = null;
  manualDialCalLookUpResponse = null;
  manDiaLlogCallEndResponse = null;
  logoutAction = true;
  parkingActive = false;
  viewDTMF = false;
  callInBound = true;
  pauseToTypify = false;
  campagentstatct = 0;
  CloserSelectBlended = 0;
  errorNotAgentChannel = false;

  mm = 0;
  ss = 0;
  ms = 0;
  isRunning = false;
  timerId;

  mmXfer = 0;
  ssXfer = 0;
  msXfer = 0;
  isRunningXfer = false;
  timerIdXfer;

  mmPause = 0;
  ssPause = 0;
  msPause = 0;
  isRunningPause = false;
  timerIdPause;

  mmPauseXfer = 0;
  ssPauseXfer = 0;
  msPauseXfer = 0;
  isRunningPauseXfer = false;
  timerIdPauseXfer;

  disableHangout = true;
  isLogin = false;
  @Output() vicidialActive = new EventEmitter<boolean>();
  campaignId: number;
  @Input() inputPhoneDisabled: boolean;
  @Input()
  public set phoneDial(phoneDial: number) {
    if (phoneDial != null && this.isLogin) {
      this.telephone = phoneDial;
      this.changeToDialCallManual();
    }
  }

  vicidialStatus;
  vicidialConfigs: any = [];
  /**
  paparamToConfigCheckrams paramatros de canal
   Check Config es un metodo que permite mantener la sesion del agente activa, este metodo recibe como respuesta
   Estados y canales de comunicacion del agente, Por ahora se ejecuta cada 2.5 sec
   */

  stendCheckRequest;

  inCommingRequest;
  inCommingActivated = false;
  inCommingRun = false;

  manDiaLlookCaLLRequest;
  beginManualDialgCall = new Date();
  tryLookCallAgain = true;
  timeInDiall;

  statusStringOptions = [
    {
      key: 'logout',
      name: 'Cerrar Sesion',
    },
    {
      key: 'ready',
      name: 'Listo',
    },
    {
      key: 'incall',
      name: 'En Llamada',
    },
    {
      key: 'conectado',
      name: 'En Llamada',
    },
    {
      key: 'pause',
      name: 'Pausado',
    },
    {
      key: 'logout',
      name: 'Cerrar Sesion',
    },
  ];

  pauseOptions = [
    { key: 'LOGIN', name: 'LOGIN' },
    { key: 'ACW', name: 'ACW' },
    { key: 'PRETU', name: 'Pre-turno' },
    { key: 'CAPA', name: 'Capacitación' },
    { key: 'BREAK', name: 'Break' },
    { key: 'BANO', name: 'Baño' },
    { key: 'ALMU', name: 'Almuerzo' },
    { key: 'PAC', name: 'Pausa Activa' },
    { key: 'FEED', name: 'Feedback' },
    { key: 'COACH', name: 'Coaching' },
    { key: 'FALLT', name: 'Falla Técnica' },
    { key: 'PAPRO', name: 'Pausa Productiva' },
    { key: 'WHAT', name: 'Whatsapp' },
    { key: 'EMAIL', name: 'Email' },
    { key: 'REDSO', name: 'Red Social' },
    { key: 'VILLA', name: 'Video Llamada' },
    { key: 'CHAT', name: 'Chat' },
    { key: 'BACK', name: 'Backoffice' }
  ];

  currentPause;

  onChangePause(event) {
    this.pause(event.value.key);
  }

  isOptionDisabled(index) {
    return index === 0 || index === 1;
  }

  /**
   Funcion que permite realizar el login en plataforma Vicidial
  campaign_id id de campaña en la que se encuentra registrado el usuario.
   */
  paramToConfigCheck: any = {};
  /**
  paparamToConfigCheckrams paramatros de canal
   Check Config es un metodo que permite mantener la sesion del agente activa, este metodo recibe como respuesta
   Estados y canales de comunicacion del agente, Por ahora se ejecuta cada 2.5 sec
   */
  checkStatusLocal;
  errorNetwork = false;

  /**
   * Metodo que inicia la marcacion 3 Way
   * Cuando no se quiere poner la llamada principal en parking entonces se ejecuta este metodo desde el (click)
   */
  xferLookCallResponse = null;
  beginCallTimexFer;
  dataCallSumary = null;
  showButtonCallSumary = false;

  /**
    * @author Fabian Duran
    * @createdate 2024-09-03
    * Metodo que retorna el resumen de la llamada analizado por la IA de voicebot.
  */
  onClickButtonResBot(): void {
    if (this.dataCallSumary) this.dataCallSumary = null;
    else {
      const dataCall = JSON.parse(localStorage.getItem('varsVicidial'));
      if (dataCall && dataCall.comments) {
        this.crudService.getData({ url: `${VOICEBOT_URL}voice_ia/call/${dataCall.comments}/` }).subscribe(res => {
          this.dataCallSumary = {
            customerSentiment: res.feeling,
            keywords: res.key_words ? res.key_words : 'No registra',
            summaryOfConversation: res.summary ? res.summary : 'No registra'
          };
        });
      }
    }
  }

  ngOnInit(): void {
    this.getVicidialConfigs();
    this.vicidialService.pauseActiveObservable.subscribe((value) => {
      this.pauseToTypify = value;
      /**
    El responsable de ejecutar esto es el sendAnswer que existe en formview (cuando se guarda la tipificiacion)
     */
      if (value == false && this.inCommingActivated) {
        this.hangUp(true);
        // Cuando el agente ya se a contectado anteriormente y se finaliza la tipificacion se pone a algente nuevamente en el grupo y ready
        //  this.selectGroup();
      } else if (value == false && !this.inCommingActivated) {
        this.hangUp(false);
        // Marcaciones manuales, cuando la crea la tipificiacion se debe poner al agente en pause
      }
    });

    /**
   Cambios que estado que vienen de CIU
   */
    this.vicidialService.statusCiuObservable.subscribe((resp: any) => {
      this.vicidialStatus = resp[0];
      if (resp[0] === 'PAUSED') {
        this.pause(resp[1]);
      } else if (resp[0] === 'READY' && this.callInBound) {
        this.selectGroup();
      } else if (resp[0] === 'LOGOUT') {
        this.logOut();
      }
    });
  }
  // Servicio que obtiene las configuraciones existentes de vicidial
  getVicidialConfigs() {
    this.vicidialService
      .getVicidialConfigs({ rrhh_id: this.rrhhId })
      .subscribe((resp: any) => {
        this.vicidialConfigs = resp.data;
      });
  }

  selectCampaign(configVicidialId) {
    this.showButtonCallSumary = Boolean(configVicidialId.vicidial_config.soulvoice);
    this.login(configVicidialId.vicidialConfig_id);
  }

  clickHandler() {
    const source = interval(1000);
    this.subscribeIntervalConnected = source.subscribe((val) => {
      this.ss++;

      if (this.ss >= 60) {
        this.mm++;
        this.ss = 0;
      }
    });
    this.isRunning = !this.isRunning;
  }

  clickHandlerXfer() {
    const source = interval(1000);
    this.subscribeIntervalXfer = source.subscribe((val) => {
      this.ssXfer++;

      if (this.ssXfer >= 60) {
        this.mmXfer++;
        this.ssXfer = 0;
      }
    });
    this.isRunningXfer = !this.isRunningXfer;
  }

  clickHandlerPause() {
    const source = interval(1000);
    this.subscribeIntervalPause = source.subscribe((val) => {
      this.ssPause++;

      if (this.ssPause >= 60) {
        this.mmPause++;
        this.ssPause = 0;
      }
    });
    this.isRunningPause = !this.isRunningPause;
  }

  clickHandlerPauseXfer() {
    const source = interval(1000);
    this.subscribeIntervalPauseXfer = source.subscribe((val) => {
      this.ssPauseXfer++;

      if (this.ssPauseXfer >= 60) {
        this.mmPauseXfer++;
        this.ssPauseXfer = 0;
      }
    });
    this.isRunningPauseXfer = !this.isRunningPauseXfer;
  }

  format(num: number) {
    return (num + '').length === 1 ? '0' + num : num + '';
  }

  translateStringStatus() {
    return this.statusStringOptions.find((e) => {
      return e.key == this.vozState;
    }).name;
  }

  login(configVicidialId) {
    this.vicidialService
      .login({ vicidialConfig_id: configVicidialId })
      .subscribe(
        (resp: any) => {
          this.campaignSelected = true;
          this.vozState = 'pause';
          localStorage.setItem('varsVicidial', JSON.stringify(resp.data));
          /**
    myVars se oobtienen las variables de sesion de vicidial.
     */
          this.myVars = resp.data;
          this.campagentstatct = this.cleanString(this.myVars.campagentstatct);
          // let campagentstdisp;

          this.optionsIVR = this.myVars.groups.map((e) => {
            return this.cleanString(e);
          });

          this.vicidialActive.emit(true);
          /**
     Se realiza la consulta del estado de sesion del agente
     */
          this.confCheck();
          this.isLogin = true;
          this.currentPause = this.pauseOptions[0];
        },
        (error) => {
          this.notificationService.alertWarning(
            'Error de Comunicación',
            'Existe un error de comunicación con Vicidial'
          );
          this.logOut();
        }
      );
  }

  confCheck() {
    let campagentstdisp;
    let mdNextCID = '';
    let phoneCustomer = '';
    if (this.inCommingResponse != null) {
      phoneCustomer = this.inCommingResponse.phoneCustomer;
    }
    if (this.manualDialCallResponse != null) {
      mdNextCID = this.manualDialCallResponse.mdNextCID;
      phoneCustomer = this.manualDialCallResponse.phoneCustomer;
    }
    if (
      this.cleanString(this.myVars.agentcallsstatus) == 1 ||
      this.cleanString(this.myVars.callholdstatus) == 1
    ) {
      this.campagentstatct++;
      if (
        this.campagentstatct > this.cleanString(this.myVars.campagentstatctmax)
      ) {
        this.campagentstatct = 0;
        campagentstdisp = 'YES';
      } else {
        campagentstdisp = 'YES';
      }
    } else {
      campagentstdisp = 'YES';
    }

    const params = {
      server_vicidial: this.cleanString(this.myVars.server_vicidial),
      campaign: this.cleanString(this.myVars.campaign),
      server_ip: this.cleanString(this.myVars.server_ip),
      session_name: this.cleanString(this.myVars.session_name),
      user: this.cleanString(this.myVars.user),
      pass: this.cleanString(this.myVars.pass),
      conf_exten: this.cleanString(this.myVars.session_id),
      auto_dial_level: this.cleanString(this.myVars.auto_dial_level),
      campagentstdisp: campagentstdisp, // Validar en que casos es si y en cuales no
      client: 'vdc',
      customer_chat_id: '',
      live_call_seconds: this.ss,
      xferchannel: '',
      check_for_answer: 0,
      MDnextCID: mdNextCID,
      phone_number: phoneCustomer,
      clicks: '',
      extension: this.cleanString(this.myVars.extension), // No borrar, variable propia de soulphone
    };
    this.stendCheckRequest = this.vicidialService
      .extendCheck(params)
      .pipe(delay(3000))
      .subscribe(
        (resp: any) => {
          this.configCheckResponse = resp.data;
          if (
            this.configCheckResponse.agentChannel == undefined ||
            this.configCheckResponse.agentChannel == ''
          ) {
            this.errorNotAgentChannel = true;
          } else {
            this.errorNotAgentChannel = false;
          }
          this.errorNetwork = false;
          this.confCheck();
          this.vicidialService.setPauseStatus(resp.data.Status);
          /*Cuando no recibe una respuesta con Status entonces se hara logout */
          if (!resp.data.Status) this.logOut();
          // if (this.checkStatusLocal == 'READY' && resp.data.Status == 'PAUSED') {
          // 	this.pause();
          // }
        },
        (error) => {
          this.errorNetwork = true;
          setTimeout((val) => {
            this.confCheck();
          }, 10000);
        }
      );
  }

  selectedGroup(value) {
    this.groupSelected = value;
  }

  selectGroup() {
    let closer_blended: string = '0';
    if (this.CloserSelectBlended) {
      closer_blended = '1';
    }
    const params = {
      server_vicidial: this.cleanString(this.myVars.server_vicidial),
      server_ip: this.cleanString(this.myVars.server_ip),
      session_name: this.cleanString(this.myVars.session_name),
      ACTION: 'regCLOSER',
      format: 'text',
      user: this.cleanString(this.myVars.user),
      pass: this.cleanString(this.myVars.pass),
      comments: '',
      closer_blended: closer_blended,
      campaign: this.cleanString(this.myVars.campaign),
      qm_phone: '',
      qm_extension: this.cleanString(this.myVars.extension),
      dial_method: this.cleanString(this.myVars.dial_method),
      closer_choice: this.groupSelected
        ? "' '" + this.groupSelected.toString().replaceAll(',', ' ') + "' -'"
        : '', // MGRLOCK- 'closer_choice':  $scope.user.groupSelected
    };
    this.vicidialService.selectGroup(params).subscribe((resp: any) => {
      this.onReady();
    });
  }

  onReady() {
    let closer_blended: string = '0';
    if (this.CloserSelectBlended) {
      closer_blended = '1';
    }
    const pause = {
      key: 'disponible',
    };

    this.vicidialService.registerPause(pause).subscribe((resp) => { });
    let stage = 'CLOSER';
    if (closer_blended == '1') stage = 'READY';

    const params = {
      server_vicidial: this.cleanString(this.myVars.server_vicidial),
      server_ip: this.cleanString(this.myVars.server_ip),
      session_name: this.cleanString(this.myVars.session_name),
      ACTION: 'VDADready',
      user: this.cleanString(this.myVars.user),
      pass: this.cleanString(this.myVars.pass),
      stage: stage, // CLOSER es cuando el blenden es 0
      agent_log_id: this.cleanString(this.myVars.agent_log_id),
      agent_log: '',
      wrapup: '',
      campaign: this.cleanString(this.myVars.campaign),
      comments: '',
      qm_extension: this.cleanString(this.myVars.extension),
      dial_method: this.cleanString(this.myVars.dial_method),
    };
    this.vicidialService.setAgentStatus(params).subscribe((resp: any) => {
      this.vozState = 'ready';
      this.inComming();
      setTimeout((e) => {
        this.checkStatusLocal = 'READY';
      }, 3000);
    });
  }

  inComming() {
    let closer_blended: string = '0';
    if (this.CloserSelectBlended) {
      closer_blended = '1';
    }
    let stage = 'CLOSER';
    if (closer_blended == '1') stage = 'READY';
    this.inCommingActivated = true;
    this.callInBound = true;
    const params = {
      server_vicidial: this.cleanString(this.myVars.server_vicidial),
      server_ip: this.cleanString(this.myVars.server_ip),
      session_name: this.cleanString(this.myVars.session_name),
      user: this.cleanString(this.myVars.user),
      pass: this.cleanString(this.myVars.pass),
      orig_pass: this.cleanString(this.myVars.pass),
      campaign: this.cleanString(this.myVars.campaign),
      ACTION: 'VDADcheckINCOMING',
      agent_log_id: this.cleanString(this.myVars.agent_log_id),
      phone_login: this.cleanString(this.myVars.phone_login),
      agent_email: '',
      conf_exten: this.cleanString(this.myVars.session_id),
      camp_script: '',
      in_script: '',
      customer_server_ip: '',
      exten: this.cleanString(this.myVars.extension), // this.myVars.recording_exten,
      original_phone_login: this.cleanString(this.myVars.original_phone_login),
      phone_pass: this.cleanString(this.myVars.phone_pass),
      VDRP_stage: stage, // CLOSER es cuando el blenden es 0
      previous_agent_log_id: this.cleanString(
        this.myVars.previous_agent_log_id
      ),
    };
    this.inCommingRequest = this.vicidialService
      .incomming(params)
      .pipe(delay(1000))
      .subscribe((resp: any) => {
        if (resp.data && resp.data.leadId) {
          this.joinToCall();
          // Se enviara api request para marcar el lead como leido, por ahora esto es necesario unicamente para formulario de DataCRM
          // Si el formulario no maneja lead no pasara nada
          this.makeNotificationLeadReaded();

          this.clickHandler();
          // Variable con los datos de la llamada
          this.inCommingResponse = resp.data;
          this.monitorConfIncomming();
          this.recheckInconming(resp.data.leadId);
          this.vozState = 'conectado';
          // Si recibe una llamda el incoming se detiene
          this.telephone = resp.data.phoneCustomer;
          //Se almacena el telefono en el local storage para carteras
          this.vicidialWalletService.setVicidialIncommingCallPhone(
            this.telephone
          );
          localStorage.setItem('varsVicidial', JSON.stringify(resp.data));

          this.callActive = true;
          this.vicidialService.setCallResponse({
            address1: resp.data.address1 ? resp.data.address1 : null,
            address2: resp.data.address2 ? resp.data.address2 : null,
            address3: resp.data.address3 ? resp.data.address3 : null,
            altPhone: resp.data.altPhone ? resp.data.altPhone : null,
            city: resp.data.city ? resp.data.city : null,
            comments: resp.data.comments ? resp.data.comments : null,
            countryCode: resp.data.countryCode ? resp.data.countryCode : null,
            dateOfBirth: resp.data.dateOfBirth ? resp.data.dateOfBirth : null,
            email: resp.data.email ? resp.data.email : null,
            first: resp.data.first ? resp.data.first : null,
            gender: resp.data.gender ? resp.data.gender : null,
            ivrSelected: resp.data.ivrSelected ? resp.data.ivrSelected : null,
            last: resp.data.last ? resp.data.last : null,
            leadId: resp.data.leadId,
            phoneCustomer: resp.data.phoneCustomer,
            documentType: resp.data.documentType
              ? resp.data.documentType
              : null,
            documentNumber: resp.data.documentNumber
              ? resp.data.documentNumber
              : null,
            uid: resp.data.uniqueId,
            cui: resp.data.mdNextCID,
            postCode: resp.data.postCode ? resp.data.postCode : null,
            province: resp.data.province ? resp.data.province : null,
            state: resp.data.state ? resp.data.state : null,
            tittle: resp.data.tittle ? resp.data.tittle : null,
          });
          this.callResponse.emit({
            address1: resp.data.address1 ? resp.data.address1 : null,
            address2: resp.data.address2 ? resp.data.address2 : null,
            address3: resp.data.address3 ? resp.data.address3 : null,
            altPhone: resp.data.altPhone ? resp.data.altPhone : null,
            city: resp.data.city ? resp.data.city : null,
            comments: resp.data.comments ? resp.data.comments : null,
            countryCode: resp.data.countryCode ? resp.data.countryCode : null,
            dateOfBirth: resp.data.dateOfBirth ? resp.data.dateOfBirth : null,
            email: resp.data.email ? resp.data.email : null,
            first: resp.data.first ? resp.data.first : null,
            gender: resp.data.gender ? resp.data.gender : null,
            ivrSelected: resp.data.ivrSelected ? resp.data.ivrSelected : null,
            last: resp.data.last ? resp.data.last : null,
            leadId: resp.data.leadId,
            phoneCustomer: resp.data.phoneCustomer,
            documentType: resp.data.documentType
              ? resp.data.documentType
              : null,
            documentNumber: resp.data.documentNumber
              ? resp.data.documentNumber
              : null,
            uid: resp.data.uniqueId,
            cui: resp.data.mdNextCID,
            postCode: resp.data.postCode ? resp.data.postCode : null,
            province: resp.data.province ? resp.data.province : null,
            state: resp.data.state ? resp.data.state : null,
            tittle: resp.data.tittle ? resp.data.tittle : null,
          });
          this.inCommingRequest.unsubscribe();

          this.pauseToTypify = true;
          this.vicidialService.setPause(true);
          this.disableHangout = false;
        } else {
          this.inComming();
        }
      });
  }

  monitorConfIncomming() {
    const date_ob = new Date();
    const date = ('0' + date_ob.getDate()).slice(-2);
    const month = ('0' + (date_ob.getMonth() + 1)).slice(-2);
    const year = date_ob.getFullYear();
    const hours = date_ob.getHours();
    const minutes = date_ob.getMinutes();
    const seconds = date_ob.getSeconds();
    const params = {
      server_vicidial: this.cleanString(this.myVars.server_vicidial),
      server_ip: this.cleanString(this.myVars.server_ip),
      session_name: this.cleanString(this.myVars.session_name),
      user: this.cleanString(this.myVars.user),
      pass: this.cleanString(this.myVars.pass),
      ACTION: 'MonitorConf',
      format: 'text',
      channel:
        'Local/5' + this.cleanString(this.myVars.session_id) + '@default',
      filename:
        'OUT_' +
        year +
        month +
        date +
        '-' +
        hours +
        minutes +
        seconds +
        '_' +
        this.myVars.group +
        '_' +
        this.myVars.user +
        '_' +
        this.inCommingResponse.phoneCustomer +
        '_' +
        this.inCommingResponse.mdNextCID, // 20210917-174358_MIOSV2_1032399970_3207671490'
      exten: this.cleanString(this.myVars.recording_exten),
      ext_context: 'default',
      lead_id: this.inCommingResponse.leadId,
      ext_priority: 1,
      FROMvdc: 'YES',
      uniqueid: 'IN',
      FROMapi: '',
    };
    this.vicidialService.monitorConf(params).subscribe((resp) => { });
  }

  changeToDialCallManual() {
    // Marcacion Manual
    this.joinToCall();
    this.callInBound = false;
    this.disableHangout = true;
    this.manualDialCalLookUpResponse = null;
    this.tryLookCallAgain = true;
    const params = {
      server_vicidial: this.cleanString(this.myVars.server_vicidial),
      server_ip: this.cleanString(this.myVars.server_ip),
      session_name: this.cleanString(this.myVars.session_name),
      ACTION: 'manDiaLnextCaLL',
      conf_exten: this.cleanString(this.myVars.session_id),
      user: this.cleanString(this.myVars.user),
      pass: this.cleanString(this.myVars.pass),
      campaign: this.cleanString(this.myVars.campaign),
      ext_context: 'default',
      dial_timeout: this.cleanString(this.myVars.dial_timeout),
      dial_prefix: this.cleanString(this.myVars.dial_prefix),
      campaign_cid: this.cleanString(this.myVars.campaign_cid),
      preview: 'NO',
      agent_log_id: this.cleanString(this.myVars.agent_log_id),
      callback_id: '',
      lead_id: '',
      phone_code: '1',
      phone_number: this.telephone,
      list_id: this.cleanString(this.myVars.mdnLisT_id),
      stage: 'lookup',
      use_internal_dnc: this.cleanString(this.myVars.use_internal_dnc),
      use_campaign_dnc: this.cleanString(this.myVars.use_campaign_dnc),
      omit_phone_code: this.cleanString(this.myVars.omit_phone_code),
      manual_dial_filter: this.cleanString(this.myVars.manual_dial_filter),
      manual_dial_search_filter: this.cleanString(
        this.myVars.manual_dial_search_filter
      ),
      vendor_lead_code: '',
      usegroupalias: '0',
      account: '',
      agent_dialed_number: '1', // TIPO MARCACION MANUAL '1'
      agent_dialed_type: 'MANUAL_DIALNOW', // TIPO MARCACION MANUAL 'MANUAL_DIALNOW'
      vtiger_callback_id: this.cleanString(this.myVars.vtiger_callback_id),
      dial_method: this.cleanString(this.myVars.dial_method),
      manual_dial_call_time_check: this.cleanString(
        this.myVars.manual_dial_call_time_check
      ),
      qm_extension: this.cleanString(this.myVars.extension),
      dial_ingroup: '',
      nocall_dial_flag: this.cleanString(this.myVars.nocall_dial_flag),
      cid_lock: this.cleanString(this.myVars.cid_lock),
      last_VDRP_stage: 'PAUSED',
      routing_initiated_recording: this.cleanString(
        this.myVars.routing_initiated_recording
      ),
      exten: this.cleanString(this.myVars.recording_exten),
      recording_filename: this.cleanString(this.myVars.campaign_rec_filename), // POR ESTABLECER
      channel:
        'Local/5' + this.cleanString(this.myVars.session_id) + '@default', // Se debe sacar de la respuesta del check config
      manual_dial_validation: this.cleanString(
        this.myVars.manual_dial_validation
      ),
      phone_login: this.cleanString(this.myVars.phone_login),
    };
    this.vicidialService.manDialCall(params).subscribe((resp: any) => {
      this.vozState = 'incall';
      this.manualDialCallResponse = resp.data;

      this.beginManualDialgCall = new Date();
      this.manDiaLlookCaLL();
      this.monitorConf();
    });
  }

  manDiaLlookCaLL() {
    let params = {};
    let phoneCustomer;
    this.timeInDiall = new Date();

    /**
     Si la marcacion manual tiene 20 o mas segundos sin recibir rspuesta se cancelan los intentos
    y se deja al agente nuevamente en pausa
    */
    if (this.timeInDiall.getTime() - this.beginManualDialgCall.getTime() >= 20000) {
      this.tryLookCallAgain = false;
      this.disableHangout = false;
      this.manDiaLlookCaLLRequest.unsubscribe();
      this.hangoutConfDialManual('look');
      this.hangupManualDial('look');
    } else {
      if (this.manualDialCallResponse != null) {
        phoneCustomer = this.manualDialCallResponse.phoneCustomer;
      } else {
        phoneCustomer = this.telephone;
      }

      if (this.manualDialCallResponse) {
        params = {
          server_vicidial: this.cleanString(this.myVars.server_vicidial),
          server_ip: this.cleanString(this.myVars.server_ip),
          session_name: this.cleanString(this.myVars.session_name),
          ACTION: 'manDiaLlookCaLL',
          conf_exten: this.cleanString(this.myVars.session_id),
          user: this.cleanString(this.myVars.user),
          pass: this.cleanString(this.myVars.pass),
          MDnextCID: this.manualDialCallResponse.mdNextCID,
          agent_log_id: this.cleanString(this.myVars.agent_log_id),
          lead_id: this.manualDialCallResponse.leadId,
          DiaL_SecondS: this.ss,
          stage: '',
          campaign: this.cleanString(this.myVars.campaign),
          phone_number: phoneCustomer,
          routing_initiated_recording: this.cleanString(
            this.myVars.routing_initiated_recording
          ),
        };
      }
      this.manDiaLlookCaLLRequest = this.vicidialService
        .manDialCallLookUp(params)
        .pipe(delay(1000))
        .subscribe((resp: any) => {
          this.manualDialCalLookUpResponse = resp.data;
          if (this.manualDialCalLookUpResponse) {
            /**
     Una vez se recibe la respuesta del dial look se realiza unsubcribe
     */
            this.manDiaLlookCaLLRequest.unsubscribe();
            this.manDiaLlogCallStart();
            this.vicidialService.setCallResponse({
              leadId: this.manualDialCallResponse.leadId,
              phoneCustomer: phoneCustomer,
              uid: resp.data.uid, // Viene del lookcall
              cui: this.manualDialCallResponse.mdNextCID,
              address1: this.manualDialCallResponse.address1
                ? this.manualDialCallResponse.address1
                : null,
              address2: this.manualDialCallResponse.address2
                ? this.manualDialCallResponse.address2
                : null,
              address3: this.manualDialCallResponse.address3
                ? this.manualDialCallResponse.address3
                : null,
              altPhone: this.manualDialCallResponse.altPhone
                ? this.manualDialCallResponse.altPhone
                : null,
              city: this.manualDialCallResponse.city
                ? this.manualDialCallResponse.city
                : null,
              comments: this.manualDialCallResponse.comments
                ? this.manualDialCallResponse.comments
                : null,
              countryCode: this.manualDialCallResponse.countryCode
                ? this.manualDialCallResponse.countryCode
                : null,
              dateOfBirth: this.manualDialCallResponse.dateOfBirth
                ? this.manualDialCallResponse.dateOfBirth
                : null,
              email: this.manualDialCallResponse.email
                ? this.manualDialCallResponse.email
                : null,
              first: this.manualDialCallResponse.first
                ? this.manualDialCallResponse.first
                : null,
              gender: this.manualDialCallResponse.gender
                ? this.manualDialCallResponse.gender
                : null,
              ivrSelected: this.manualDialCallResponse.ivrSelected
                ? this.manualDialCallResponse.ivrSelected
                : null,
              last: this.manualDialCallResponse.last
                ? this.manualDialCallResponse.last
                : null,
              documentType: this.manualDialCallResponse.documentType
                ? resp.data.documentType
                : null,
              documentNumber: this.manualDialCallResponse.documentNumber
                ? resp.data.documentNumber
                : null,
              postCode: this.manualDialCallResponse.postCode
                ? resp.data.postCode
                : null,
              province: this.manualDialCallResponse.province
                ? resp.data.province
                : null,
              state: this.manualDialCallResponse.state ? resp.data.state : null,
              tittle: this.manualDialCallResponse.tittle
                ? resp.data.tittle
                : null,
            });
            this.callResponse.emit({
              leadId: this.manualDialCallResponse.leadId,
              phoneCustomer: phoneCustomer,
              uid: resp.data.uid, // Viene del lookcall
              cui: this.manualDialCallResponse.mdNextCID,
              address1: this.manualDialCallResponse.address1
                ? this.manualDialCallResponse.address1
                : null,
              address2: this.manualDialCallResponse.address2
                ? this.manualDialCallResponse.address2
                : null,
              address3: this.manualDialCallResponse.address3
                ? this.manualDialCallResponse.address3
                : null,
              altPhone: this.manualDialCallResponse.altPhone
                ? this.manualDialCallResponse.altPhone
                : null,
              city: this.manualDialCallResponse.city
                ? this.manualDialCallResponse.city
                : null,
              comments: this.manualDialCallResponse.comments
                ? this.manualDialCallResponse.comments
                : null,
              countryCode: this.manualDialCallResponse.countryCode
                ? this.manualDialCallResponse.countryCode
                : null,
              dateOfBirth: this.manualDialCallResponse.dateOfBirth
                ? this.manualDialCallResponse.dateOfBirth
                : null,
              email: this.manualDialCallResponse.email
                ? this.manualDialCallResponse.email
                : null,
              first: this.manualDialCallResponse.first
                ? this.manualDialCallResponse.first
                : null,
              gender: this.manualDialCallResponse.gender
                ? this.manualDialCallResponse.gender
                : null,
              ivrSelected: this.manualDialCallResponse.ivrSelected
                ? this.manualDialCallResponse.ivrSelected
                : null,
              last: this.manualDialCallResponse.last
                ? this.manualDialCallResponse.last
                : null,
              documentType: this.manualDialCallResponse.documentType
                ? resp.data.documentType
                : null,
              documentNumber: this.manualDialCallResponse.documentNumber
                ? resp.data.documentNumber
                : null,
              postCode: this.manualDialCallResponse.postCode
                ? resp.data.postCode
                : null,
              province: this.manualDialCallResponse.province
                ? resp.data.province
                : null,
              state: this.manualDialCallResponse.state ? resp.data.state : null,
              tittle: this.manualDialCallResponse.tittle
                ? resp.data.tittle
                : null,
            });
            this.disableHangout = false;
            this.pauseToTypify = true;

            this.vicidialService.setCallManualResponse({
              leadId: this.manualDialCallResponse.leadId,
              phoneCustomer: this.telephone,
              uid: resp.data.uid, // Viene del lookcall
              cui: this.manualDialCallResponse.mdNextCID,
              address1: this.manualDialCallResponse.address1
                ? this.manualDialCallResponse.address1
                : null,
              address2: this.manualDialCallResponse.address2
                ? this.manualDialCallResponse.address2
                : null,
              address3: this.manualDialCallResponse.address3
                ? this.manualDialCallResponse.address3
                : null,
              altPhone: this.manualDialCallResponse.altPhone
                ? this.manualDialCallResponse.altPhone
                : null,
              city: this.manualDialCallResponse.city
                ? this.manualDialCallResponse.city
                : null,
              comments: this.manualDialCallResponse.comments
                ? this.manualDialCallResponse.comments
                : null,
              countryCode: this.manualDialCallResponse.countryCode
                ? this.manualDialCallResponse.countryCode
                : null,
              dateOfBirth: this.manualDialCallResponse.dateOfBirth
                ? this.manualDialCallResponse.dateOfBirth
                : null,
              email: this.manualDialCallResponse.email
                ? this.manualDialCallResponse.email
                : null,
              first: this.manualDialCallResponse.first
                ? this.manualDialCallResponse.first
                : null,
              gender: this.manualDialCallResponse.gender
                ? this.manualDialCallResponse.gender
                : null,
              ivrSelected: this.manualDialCallResponse.ivrSelected
                ? this.manualDialCallResponse.ivrSelected
                : null,
              last: this.manualDialCallResponse.last
                ? this.manualDialCallResponse.last
                : null,
              documentType: this.manualDialCallResponse.documentType
                ? resp.data.documentType
                : null,
              documentNumber: this.manualDialCallResponse.documentNumber
                ? resp.data.documentNumber
                : null,
              postCode: this.manualDialCallResponse.postCode
                ? resp.data.postCode
                : null,
              province: this.manualDialCallResponse.province
                ? resp.data.province
                : null,
              state: this.manualDialCallResponse.state ? resp.data.state : null,
              tittle: this.manualDialCallResponse.tittle
                ? resp.data.tittle
                : null,
            });

            // this.vicidialService.setPause(true);
          } else {
            /**
     Mientras no se reciba respuesta se vulve a ejecutar el dialLookCall
     */
            if (this.tryLookCallAgain) this.manDiaLlookCaLL();
          }
        });
    }
  }

  monitorConf() {
    let phoneCustomer;
    let mdNextCID;
    let leadId;
    if (this.inCommingResponse != null) {
      phoneCustomer = this.inCommingResponse.phoneCustomer;
      mdNextCID = this.inCommingResponse.mdNextCID;
      leadId = this.inCommingResponse.leadId;
    } else {
      phoneCustomer = this.telephone;
      mdNextCID = this.manualDialCallResponse.mdNextCID;
      leadId = this.manualDialCallResponse.leadId;
    }
    const date_ob = new Date();
    const date = ('0' + date_ob.getDate()).slice(-2);
    const month = ('0' + (date_ob.getMonth() + 1)).slice(-2);
    const year = date_ob.getFullYear();
    const hours = date_ob.getHours();
    const minutes = date_ob.getMinutes();
    const seconds = date_ob.getSeconds();
    let fileName =
      'OUT_' +
      year +
      month +
      date +
      '-' +
      hours +
      minutes +
      seconds +
      '_' +
      this.cleanString(this.myVars.group) +
      '_' +
      this.cleanString(this.myVars.user) +
      '_' +
      phoneCustomer +
      '_' +
      mdNextCID; // OUT_20231212-13930_SOULPHON_1032399970_null_M2121309300013809855
    if (this.manualDialCallResponse != null) {
      phoneCustomer = this.manualDialCallResponse.phoneCustomer;
      fileName =
        year +
        month +
        date +
        '-' +
        hours +
        minutes +
        seconds +
        '_' +
        phoneCustomer; // 20231212-142517_3144016953
    }
    const params = {
      server_vicidial: this.cleanString(this.myVars.server_vicidial),
      server_ip: this.cleanString(this.myVars.server_ip),
      session_name: this.cleanString(this.myVars.session_name),
      user: this.cleanString(this.myVars.user),
      pass: this.cleanString(this.myVars.pass),
      ACTION: 'MonitorConf',
      format: 'text',
      channel:
        'Local/5' + this.cleanString(this.myVars.session_id) + '@default',
      filename: fileName,
      exten: this.cleanString(this.myVars.recording_exten),
      ext_context: 'default',
      lead_id: leadId,
      ext_priority: 1,
      FROMvdc: 'YES',
      uniqueid: '',
      FROMapi: '',
    };
    this.vicidialService.monitorConf(params).subscribe((resp) => { });
  }

  manDiaLlogCallStart() {
    const pause = {
      key: 'marcacion-manual',
    };
    let phoneCustomer;
    let altDial;
    let listId = this.myVars.mdnLisT_id;
    let calledCount;
    let phoneCode = '';

    if (this.manualDialCallResponse != null) {
      phoneCustomer = this.manualDialCallResponse.phoneCustomer;
      listId = this.manualDialCallResponse.listId;
      altDial = 'MAIN';
      calledCount = this.manualDialCallResponse.called_count;
      phoneCode = this.manualDialCallResponse.phoneCode;
    }

    if (this.telephone != null) {
      phoneCustomer = this.telephone;
      altDial = 'MANUAL_DIALNOW';
    }

    this.vicidialService.registerPause(pause).subscribe((resp) => { });

    const params = {
      server_vicidial: this.cleanString(this.myVars.server_vicidial),
      format: 'text',
      server_ip: this.cleanString(this.myVars.server_ip),
      session_name: this.cleanString(this.myVars.session_name),
      ACTION: 'manDiaLlogCaLL',
      stage: 'start',
      uniqueid: this.manualDialCalLookUpResponse.uid,
      user: this.cleanString(this.myVars.user),
      pass: this.cleanString(this.myVars.pass),
      campaign: this.cleanString(this.myVars.campaign),
      lead_id: this.manualDialCallResponse.leadId,
      list_id: listId,
      length_in_sec: this.ss,
      phone_code: phoneCode,
      phone_number: phoneCustomer,
      exten: this.cleanString(this.myVars.recording_exten),
      channel: this.manualDialCalLookUpResponse.channel,
      start_epoch: 0,
      auto_dial_level: this.cleanString(this.myVars.auto_dial_level),
      VDstop_rec_after_each_call: this.cleanString(
        this.myVars.VDstop_rec_after_each_call
      ),
      conf_silent_prefix: this.cleanString(this.myVars.conf_silent_prefix),
      protocol: this.cleanString(this.myVars.protocol),
      extension: this.cleanString(this.myVars.extension),
      ext_context: 'default',
      conf_exten: this.cleanString(this.myVars.session_id),
      user_abb: this.cleanString(this.myVars.user_abb),
      agent_log_id: this.cleanString(this.myVars.agent_log_id),
      MDnextCID: this.manualDialCallResponse.mdNextCID,
      inOUT: 'OUT',
      alt_dial: altDial,
      DB: 0,
      agentchannel: this.configCheckResponse.agentChannel,
      conf_dialed: 0,
      leaving_threeway: 0,
      hangup_all_non_reserved: this.cleanString(
        this.myVars.hangup_all_non_reserved
      ),
      blind_transfer: 0,
      dial_method: this.cleanString(this.myVars.dial_method),
      nodeletevdac: 'undefined',
      alt_num_status: 0,
      qm_extension: this.cleanString(this.myVars.extension),
      called_count: calledCount, //Variable que viene de manDiaLnextCaLL
      leave_3way_start_recording_trigger: 0,
      leave_3way_start_recording_filename: '',
      channelrec:
        'Local/5' + this.cleanString(this.myVars.session_id) + '@default',
    };
    this.vicidialService.manDiaLlogCallStart(params).subscribe((resp: any) => {
      this.vozState = 'conectado';
      this.clickHandler();
      if (this.manualDialCallResponse != null) {
        this.telephone = this.manualDialCallResponse.phoneCustomer;
      }
    });
  }

  hangoutCustomerCall(callInBound?) {
    let channel;
    let campaign;
    let mdNextCID;
    let call_server_ip;

    if (this.inCommingResponse != null) {
      channel = this.inCommingResponse.channel;
      callInBound
        ? (campaign = this.inCommingResponse.campaign)
        : (campaign = this.myVars.campaign);
      if (campaign == null || campaign == '') {
        campaign = this.myVars.campaign;
      }
      mdNextCID = this.inCommingResponse.mdNextCID ?? '';
      call_server_ip = this.inCommingResponse.serverIP;
    } else {
      call_server_ip = this.myVars.server_ip;
      campaign = this.myVars.campaign;
      if (this.manualDialCalLookUpResponse != null) {
        channel = this.manualDialCalLookUpResponse.channel;
        mdNextCID = this.manualDialCalLookUpResponse.mdNextCID;
      }
    }
    if (this.manualDialCallResponse != null) {
      call_server_ip = '';
      mdNextCID = this.manualDialCallResponse.mdNextCID;
    }
    const params = {
      server_vicidial: this.cleanString(this.myVars.server_vicidial),
      server_ip: this.cleanString(this.myVars.server_ip),
      session_name: this.cleanString(this.myVars.session_name),
      user: this.cleanString(this.myVars.user),
      pass: this.cleanString(this.myVars.pass),
      ACTION: 'Hangup',
      format: 'text',
      channel: channel,
      call_server_ip: call_server_ip,
      queryCID:
        'HLvdcW' +
        this.cleanString(this.myVars.epoch_sec) +
        '' +
        this.cleanString(this.myVars.user_abb),
      exten: this.cleanString(this.myVars.session_id),
      auto_dial_level: this.cleanString(this.myVars.auto_dial_level),
      campaign: this.cleanString(campaign), // Este es la opcion de ivr por donde se recibe la llamada, se extrae de incoming,
      stage: 'CALLHANGUP',
      nodeletevdac: '',
      log_campaign: this.cleanString(this.myVars.campaign),
      qm_extension: this.cleanString(this.myVars.extension),
      CalLCID: mdNextCID,
      secondS: this.ss,
    };
    this.vicidialService.hangUp(params).subscribe((resp: any) => {
      callInBound ? this.hangout2(false) : this.hangout(false);
      // this.updateDispo();
    });
  }

  hangout(callTransfered, leave3Way?) {
    // End de marcacion manual
    let leadId;
    let uniqueId;
    let autoDialLevel;
    let mdNextCID;
    let listId = this.cleanString(this.myVars.mdnLisT_id);
    let phoneCode;
    let phoneNumber;
    let channel;
    let altDial;
    let dialMethod = 'RATIO';
    let calledCount;

    if (this.inCommingResponse != null) {
      leadId = this.inCommingResponse.leadId;
      uniqueId = this.inCommingResponse.uniqueId;
      mdNextCID = this.inCommingResponse.mdNextCID;
      listId = this.inCommingResponse.listId;
      phoneCode = this.inCommingResponse.dialCode;
      phoneNumber = this.inCommingResponse.phoneCustomer;
      channel = this.inCommingResponse.channel;
    }
    if (this.manualDialCallResponse != null) {
      leadId = this.manualDialCallResponse.leadId;
      uniqueId = this.manualDialCallResponse.uid;
      mdNextCID = this.manualDialCallResponse.mdNextCID;
      listId = this.manualDialCallResponse.listId;
      phoneCode = this.manualDialCallResponse.dialCode;
      phoneNumber = this.manualDialCallResponse.phoneCustomer;
      channel = this.manualDialCallResponse.channel;
      altDial = 'MAIN';
      dialMethod = 'MANUAL';
      calledCount = this.manualDialCallResponse.called_count;
    }
    if (this.manualDialCalLookUpResponse != null) {
      uniqueId = this.manualDialCalLookUpResponse.uid;
      channel = this.manualDialCalLookUpResponse.channel;
    }

    if (this.telephone) {
      phoneNumber = this.telephone;
      phoneCode = '1';
      altDial = 'MANUAL_DIALNOW';
    }

    const params = {
      server_vicidial: this.cleanString(this.myVars.server_vicidial),
      format: 'text',
      server_ip: this.cleanString(this.myVars.server_ip),
      session_name: this.cleanString(this.myVars.session_name),
      ACTION: 'manDiaLlogCaLL',
      stage: 'end',
      uniqueid: uniqueId,
      user: this.cleanString(this.myVars.user),
      pass: this.cleanString(this.myVars.pass),
      campaign: this.cleanString(this.myVars.campaign),
      lead_id: leadId,
      list_id: listId,
      length_in_sec: 0,
      phone_code: phoneCode,
      phone_number: phoneNumber,
      exten: callTransfered
        ? this.cleanString(this.myVars.extension)
        : this.cleanString(this.myVars.recording_exten), // SE USA EXTENSION CUANDO LA LLAMADA ES TRANSFERIDO //CUANDO EL COLGADO ES NORMAL this.myVars.recording_exten,
      channel: channel,
      start_epoch: callTransfered ? 0 : this.cleanString(this.myVars.epoch_sec), // CUANDO ES COLGAR LLAMADA NORMAL cleanString(this.myVars.epoch_sec), //   POR CONFIRMAR SI LA VARIABLE CORRECTA ES [epoch_sec] |  SIP/proxy-180-000000b0 [cuando es llamada entrante]
      auto_dial_level: this.cleanString(this.myVars.auto_dial_level),
      VDstop_rec_after_each_call: this.cleanString(
        this.myVars.VDstop_rec_after_each_call
      ),
      conf_silent_prefix: this.cleanString(this.myVars.conf_silent_prefix),
      protocol: this.cleanString(this.myVars.protocol),
      extension: this.cleanString(this.myVars.extension),
      ext_context: 'default',
      conf_exten: this.cleanString(this.myVars.session_id),
      user_abb: this.cleanString(this.myVars.user_abb),
      agent_log_id: this.cleanString(this.myVars.agent_log_id),
      MDnextCID: mdNextCID,
      inOUT: 'OUT',
      alt_dial: altDial,
      DB: 0,
      agentchannel: this.configCheckResponse.agentChannel,
      conf_dialed: 0,
      leaving_threeway: leave3Way ? 1 : 0, // UINCAMENTE PARA SALIR DE 3 WAY
      hangup_all_non_reserved: this.cleanString(
        this.myVars.hangup_all_non_reserved
      ),
      blind_transfer: callTransfered ? 1 : 0, // 0 CUANDO ES NORMAL,
      dial_method: this.cleanString(this.myVars.dial_method),
      nodeletevdac: callTransfered ? 0 : '', // NULL CUANDO ES NORMAL,
      alt_num_status: 0,
      qm_extension: this.cleanString(this.myVars.extension),
      called_count: calledCount,
      leave_3way_start_recording_trigger: 0,
      leave_3way_start_recording_filename: '',
      channelrec:
        'Local/5' + this.cleanString(this.myVars.session_id) + '@default',
    };
    this.vicidialService.manDiaLlogCaLL(params).subscribe((resp: any) => {
      if (this.manDiaLlookCaLLRequest) this.manDiaLlookCaLLRequest.unsubscribe();
      this.manDiaLlogCallEndResponse = resp.data;
      this.updateLead();
      if (this.manualDialCalLookUpResponse) {
        this.updateDispo();
      }

      setTimeout(() => {
        if (this.subscribeIntervalConnected) {
          this.subscribeIntervalConnected.unsubscribe();
        }
        this.ss = 0;
        this.mm = 0;
        this.inCommingResponse = null;
        this.manualDialCallResponse = null;
        this.manualDialCalLookUpResponse = null;
        this.manDiaLlogCallEndResponse = null;
        this.telephone = null;
        this.pause('ACW');
        this.currentPause = this.pauseOptions.find(key => key.key == 'ACW');
        this.vicidialService.setHangUp(true);
        this.pauseToTypify = false;
        // Si la variable esta en false se reanurada al agente al grupo y al incoming.
        // if (!this.pauseToTypify) {
        // this.selectGroup();
        // }
      }, 1000);
    });
  }

  hangout2(callTransfered, leave3Way?) {
    let leadId;
    let uniqueId;
    let autoDialLevel;
    let mdNextCID;
    let listId;
    let phoneCode;
    let phoneNumber;
    let channel;

    if (this.inCommingResponse != null) {
      leadId = this.inCommingResponse.leadId;
      uniqueId = this.inCommingResponse.uniqueId;
      mdNextCID = this.inCommingResponse.mdNextCID;
      listId = this.inCommingResponse.listId;
      phoneCode = this.inCommingResponse.dialCode;
      phoneNumber = this.inCommingResponse.phoneCustomer;
      channel = this.inCommingResponse.channel;
    }
    if (this.manualDialCallResponse != null) {
      leadId = this.manualDialCallResponse.leadId;
      uniqueId = this.manualDialCalLookUpResponse.uid;
      mdNextCID = this.manualDialCalLookUpResponse.mdNextCID;
      listId = this.cleanString(this.myVars.mdnLisT_id);
      phoneCode = 1;
      phoneNumber = this.telephone;
      channel = this.configCheckResponse.agentChannel;
    }
    const params = {
      server_vicidial: this.cleanString(this.myVars.server_vicidial),
      format: 'text',
      server_ip: this.cleanString(this.myVars.server_ip),
      session_name: this.cleanString(this.myVars.session_name),
      ACTION: 'manDiaLlogCaLL',
      stage: 'end',
      uniqueid: uniqueId,
      user: this.cleanString(this.myVars.user),
      pass: this.cleanString(this.myVars.pass),
      campaign: this.cleanString(this.myVars.campaign),
      lead_id: leadId,
      list_id: listId,
      length_in_sec: 0,
      phone_code: phoneCode,
      phone_number: phoneNumber,
      exten: callTransfered
        ? this.myVars.extension
        : this.cleanString(this.myVars.recording_exten), // SE USA EXTENSION CUANDO LA LLAMADA ES TRANSFERIDO //CUANDO EL COLGADO ES NORMAL this.myVars.recording_exten,
      channel: channel,
      // start_epoch: callTransfered ? 0 : this.cleanString(this.myVars.epoch_sec), // CUANDO ES COLGAR LLAMADA NORMAL cleanString(this.myVars.epoch_sec), //   POR CONFIRMAR SI LA VARIABLE CORRECTA ES [epoch_sec] |  SIP/proxy-180-000000b0 [cuando es llamada entrante]
      start_epoch: 0,
      auto_dial_level: this.cleanString(this.myVars.auto_dial_level),
      VDstop_rec_after_each_call: this.cleanString(
        this.myVars.VDstop_rec_after_each_call
      ),
      conf_silent_prefix: this.cleanString(this.myVars.conf_silent_prefix),
      protocol: this.cleanString(this.myVars.protocol),
      extension: this.cleanString(this.myVars.extension),
      ext_context: 'default',
      conf_exten: this.cleanString(this.myVars.session_id),
      user_abb: this.cleanString(this.myVars.user_abb),
      agent_log_id: this.cleanString(this.myVars.agent_log_id),
      MDnextCID: mdNextCID,
      inOUT: 'IN',
      alt_dial: 'MAIN',
      DB: 0,
      agentchannel: this.configCheckResponse.agentChannel,
      conf_dialed: 0,
      leaving_threeway: leave3Way ? 1 : 0, //UINCAMENTE PARA SALIR DE 3 WAY
      hangup_all_non_reserved: 1,
      blind_transfer: callTransfered ? 1 : 0, // 0 CUANDO ES NORMAL,
      dial_method: this.cleanString(this.myVars.dial_method),
      nodeletevdac: callTransfered ? 0 : '', // NULL CUANDO ES NORMAL,
      alt_num_status: 0,
      qm_extension: this.cleanString(this.myVars.extension),
      called_count: callTransfered ? 1 : 1, // 13 CUANDO ES NORMAL,
      leave_3way_start_recording_trigger: 0,
      leave_3way_start_recording_filename: '',
      channelrec:
        'Local/5' + this.cleanString(this.myVars.session_id) + '@default',
    };
    this.vicidialService.manDiaLlogCaLL(params).subscribe((resp: any) => {
      if (this.subscribeIntervalConnected) {
        this.subscribeIntervalConnected.unsubscribe();
      }
      this.manDiaLlogCallEndResponse = resp.data;
      this.updateLead();
      this.updateDispo();
      setTimeout(() => {
        if (this.subscribeIntervalConnected) {
          this.subscribeIntervalConnected.unsubscribe();
        }
        this.ss = 0;
        this.mm = 0;
        this.inCommingResponse = null;
        this.manualDialCallResponse = null;
        this.manualDialCalLookUpResponse = null;
        this.manDiaLlogCallEndResponse = null;
        this.telephone = null;
        this.pause('ACW');
        this.currentPause = this.pauseOptions.find(key => key.key == 'ACW');
        this.vicidialService.setHangUp(true);
        this.pauseToTypify = false;
        // Si la variable esta en false se reanurada al agente al grupo y al incoming.
        // if (!this.pauseToTypify) {
        // this.selectGroup();
        // }
      }, 1000);
    });
  }

  joinToCall() {
    const params = {
      server_vicidial: this.cleanString(this.myVars.server_vicidial),
      server_ip: this.cleanString(this.myVars.server_ip),
      session_name: this.cleanString(this.myVars.session_name),
      user: this.cleanString(this.myVars.user),
      pass: this.cleanString(this.myVars.pass),
      ACTION: 'update_settings',
      format: 'text',
      agent_log_id: this.cleanString(this.myVars.agent_log_id),
      campaign: this.cleanString(this.myVars.campaign),
    };
    this.vicidialService.joinToCall(params).subscribe((resp: any) => { });
  }

  recheckInconming(leadId) {
    const params = {
      server_vicidial: this.cleanString(this.myVars.server_vicidial),
      server_ip: this.cleanString(this.myVars.server_ip),
      session_name: this.cleanString(this.myVars.session_name),
      user: this.cleanString(this.myVars.user),
      pass: this.cleanString(this.myVars.pass),
      ACTION: 'VDADREcheckINCOMING',
      agent_log_id: this.cleanString(this.myVars.agent_log_id),
      campaign: this.cleanString(this.myVars.campaign),
      lead_id: leadId,
    };
    this.vicidialService.recheckInconming(params).subscribe((resp: any) => { });
  }

  transferCloser(group) {
    let call_server_ip;

    if (this.inCommingResponse != null) {
      call_server_ip = this.inCommingResponse.serverIP;
    } else {
      call_server_ip = this.myVars.server_ip;
    }
    const params = {
      server_vicidial: this.cleanString(this.myVars.server_vicidial),
      server_ip: this.cleanString(this.myVars.server_ip),
      session_name: this.cleanString(this.myVars.session_name),
      user: this.cleanString(this.myVars.user),
      pass: this.cleanString(this.myVars.pass),
      ACTION: 'RedirectVD',
      format: 'text',
      channel: this.inCommingResponse.channel,
      call_server_ip: call_server_ip,
      queryCID:
        'XLvdcW' +
        this.cleanString(this.myVars.epoch_sec) +
        '' +
        this.cleanString(this.myVars.user_abb),
      exten:
        '990009*' +
        this.cleanString(group) +
        '**' +
        this.cleanString(this.inCommingResponse.leadId) +
        '**' +
        this.cleanString(this.inCommingResponse.phoneCustomer) +
        '*' +
        this.cleanString(this.myVars.user) +
        '**',
      ext_context: 'default',
      ext_priority: '1',
      auto_dial_level: this.cleanString(this.myVars.auto_dial_level),
      campaign: this.cleanString(this.myVars.campaign),
      uniqueid: this.inCommingResponse.uniqueId,
      lead_id: this.inCommingResponse.leadId,
      secondS: this.ss,
      session_id: this.cleanString(this.myVars.session_id),
      CalLCID: this.inCommingResponse.mdNextCID,
      customerparked: 0,
    };
    this.vicidialService.transfer(params).subscribe((resp: any) => {
      this.hangout2(true);
      // this.updateDispo();
      // this.telephone = null;
      // this.inCommingResponse = null;
      // this.selectGroup();
    });
  }

  hangoutConfDialManual(state?) {
    const params = {
      server_vicidial: this.cleanString(this.myVars.server_vicidial),
      server_ip: this.cleanString(this.myVars.server_ip),
      session_name: this.cleanString(this.myVars.session_name),
      user: this.cleanString(this.myVars.user),
      pass: this.cleanString(this.myVars.pass),
      exten: this.cleanString(this.myVars.session_id),
      ACTION: 'HangupConfDial',
      format: 'text',
      ext_context: 'default',
      queryCID:
        'HTvdcW' +
        this.cleanString(this.myVars.epoch_sec) +
        '' +
        this.cleanString(this.myVars.user_abb),
      log_campaign: this.cleanString(this.myVars.campaign),
      qm_extension: this.cleanString(this.myVars.extension),
    };
    this.vicidialService.hangUp(params).subscribe((resp: any) => {
      if (state != 'look') {
        this.hangoutCustomerCall();
      }
    });
  }

  hangupManualDial(state?) {
    const params = {
      server_vicidial: this.cleanString(this.myVars.server_vicidial),
      format: 'text',
      server_ip: this.cleanString(this.myVars.server_ip),
      session_name: this.cleanString(this.myVars.session_name),
      ACTION: 'manDiaLlogCaLL',
      stage: 'end',
      uniqueid: this.manualDialCalLookUpResponse
        ? this.manualDialCalLookUpResponse.uid
        : '',
      user: this.cleanString(this.myVars.user),
      pass: this.cleanString(this.myVars.pass),
      campaign: this.cleanString(this.myVars.campaign),
      lead_id: this.manualDialCalLookUpResponse
        ? this.manualDialCalLookUpResponse.leadId
        : this.manualDialCallResponse.leadId,
      list_id: this.manualDialCallResponse
        ? this.manualDialCallResponse.listId
        : this.cleanString(this.myVars.mdnLisT_id),
      length_in_sec: this.ss,
      phone_code: 1,
      phone_number: this.manualDialCallResponse ? this.manualDialCallResponse.phoneCustomer : this.telephone,
      exten: this.cleanString(this.myVars.recording_exten),
      channel: this.manualDialCalLookUpResponse
        ? this.manualDialCalLookUpResponse.channel
        : '',
      start_epoch: 0, //   POR CONFIRMAR SI LA VARIABLE CORRECTA ES [epoch_sec] |  SIP/proxy-180-000000b0 [cuando es llamada entrante]
      auto_dial_level: this.cleanString(this.myVars.auto_dial_level),
      VDstop_rec_after_each_call: this.cleanString(
        this.myVars.VDstop_rec_after_each_call
      ),
      conf_silent_prefix: this.cleanString(this.myVars.conf_silent_prefix),
      protocol: this.cleanString(this.myVars.protocol),
      extension: this.cleanString(this.myVars.extension),
      ext_context: 'default',
      conf_exten: this.cleanString(this.myVars.session_id),
      user_abb: this.cleanString(this.myVars.user_abb),
      agent_log_id: this.cleanString(this.myVars.agent_log_id),
      MDnextCID: this.manualDialCalLookUpResponse
        ? this.manualDialCalLookUpResponse.mdNextCID
        : this.manualDialCallResponse.mdNextCID,
      inOUT: 'OUT',
      alt_dial: state == 'look' ? 'MAIN' : 'MANUAL_DIALNOW',
      DB: 0,
      agentchannel: this.configCheckResponse.agentChannel,
      conf_dialed: 0,
      leaving_threeway: 0,
      hangup_all_non_reserved: 1,
      blind_transfer: 0,
      dial_method: this.cleanString(this.myVars.dial_method),
      nodeletevdac: '',
      alt_num_status: 0,
      qm_extension: this.cleanString(this.myVars.extension),
      called_count: state == 'look' ? '1' : '13',
      leave_3way_start_recording_trigger: 0,
      leave_3way_start_recording_filename: '',
      channelrec: 'Local/58600053@default',
    };

    this.vicidialService.manDiaLlogCallEnd(params).subscribe((resp: any) => {
      this.manDiaLlogCallEndResponse = resp.data;
      this.updateLead();
      this.updateDispo();
      setTimeout(() => {
        if (this.subscribeIntervalConnected) {
          this.subscribeIntervalConnected.unsubscribe();
        }
        this.ss = 0;
        this.mm = 0;
        this.inCommingResponse = null;
        this.manualDialCallResponse = null;
        this.manualDialCalLookUpResponse = null;
        this.manDiaLlogCallEndResponse = null;
        this.telephone = null;
        this.tryLookCallAgain = false;
        this.vozState = 'pause';
        this.disableHangout = false;
        if (this.manDiaLlookCaLLRequest)
          this.manDiaLlookCaLLRequest.unsubscribe();
        this.pause('ACW');
        this.currentPause = this.pauseOptions.find(key => key.key == 'ACW');
        this.vicidialService.setHangUp(true);
        this.pauseToTypify = false;
      }, 1000);
    });
  }

  parking() {
    let call_server_ip;
    let mdNextCID;

    if (this.inCommingResponse != null) {
      call_server_ip = this.inCommingResponse.serverIP;
      mdNextCID = this.inCommingResponse.mdNextCID;
    } else {
      call_server_ip = this.myVars.server_ip;
      mdNextCID = this.manualDialCalLookUpResponse.mdNextCID;
    }
    const params = {
      server_vicidial: this.cleanString(this.myVars.server_vicidial),
      server_ip: this.cleanString(this.myVars.server_ip),
      session_name: this.cleanString(this.myVars.session_name),
      user: this.cleanString(this.myVars.user),
      pass: this.cleanString(this.myVars.pass),
      ACTION: 'RedirectToPark',
      format: 'text',
      channel: this.inCommingResponse.channel,
      call_server_ip: call_server_ip,
      queryCID:
        'LPvdcW' +
        this.cleanString(this.myVars.epoch_sec) +
        '' +
        this.cleanString(this.myVars.user_abb),
      exten: this.cleanString(this.myVars.park_on_extension),
      ext_context: 'default',
      ext_priority: 1,
      extenName: 'park',
      parkedby: 'SIP/' + this.cleanString(this.myVars.extension),
      session_id: this.cleanString(this.myVars.session_id),
      CalLCID: mdNextCID,
      uniqueid: this.inCommingResponse.uniqueId,
      lead_id: this.inCommingResponse.leadId,
      campaign: this.cleanString(this.myVars.campaign),
      group_id: this.groupSelected,
    };
    this.vicidialService.parking(params).subscribe((resp: any) => {
      this.clickHandlerPause();
      this.callPause = true;

      // this.onReady();
    });
  }

  recoveryParking() {
    let call_server_ip;
    let mdNextCID;

    if (this.inCommingResponse != null) {
      call_server_ip = this.inCommingResponse.serverIP;
      mdNextCID = this.inCommingResponse.mdNextCID;
    } else {
      call_server_ip = this.myVars.server_ip;
      mdNextCID = this.manualDialCalLookUpResponse.mdNextCID;
    }
    const params = {
      server_vicidial: this.cleanString(this.myVars.server_vicidial),
      server_ip: this.cleanString(this.myVars.server_ip),
      session_name: this.cleanString(this.myVars.session_name),
      user: this.cleanString(this.myVars.user),
      pass: this.cleanString(this.myVars.pass),
      ACTION: 'RedirectFromPark',
      format: 'text',
      channel: this.inCommingResponse.channel,
      call_server_ip: call_server_ip,
      queryCID:
        'FPvdcW' +
        this.cleanString(this.myVars.epoch_sec) +
        '' +
        this.cleanString(this.myVars.user_abb),
      exten:
        this.cleanString(this.myVars.server_ip_dialstring) +
        this.cleanString(this.myVars.session_id),
      ext_context: 'default',
      ext_priority: 1,
      session_id: this.cleanString(this.myVars.session_id),
      CalLCID: mdNextCID,
      uniqueid: this.inCommingResponse.uniqueId,
      lead_id: this.inCommingResponse.leadId,
      campaign: this.cleanString(this.myVars.campaign),
    };
    this.vicidialService.parkingRecovery(params).subscribe((resp: any) => {
      this.subscribeIntervalPause.unsubscribe();
      this.mmPause = 0;
      this.ssPause = 0;
      this.msPause = 0;
      this.isRunningPause = false;
      this.timerIdPause;
      this.callPause = false;
      this.parkingActive = false;
    });
  }

  updateLead(grupo?) {
    let leadId;
    let phone;
    let title;
    let first_name;
    let middle_initial;
    let last_name;
    let address1;
    let address2;
    let address3;
    let city;
    let state;
    let province;
    let postal_code;
    let country_code;
    let gender;
    let date_of_birth;
    let alt_phone;
    let email;
    let comments;
    let vendorLeadCode;
    let securityPhrase;

    if (this.inCommingResponse != null) {
      leadId = this.inCommingResponse.leadId;
      phone = this.inCommingResponse.phoneCustomer;
      title = this.inCommingResponse.title;
      first_name = this.inCommingResponse.first;
      middle_initial = this.inCommingResponse.mi;
      last_name = this.inCommingResponse.last;
      address1 = this.inCommingResponse.address1;
      address2 = this.inCommingResponse.address2;
      address3 = this.inCommingResponse.address3;
      city = this.inCommingResponse.city;
      state = this.inCommingResponse.state;
      province = this.inCommingResponse.province;
      postal_code = this.inCommingResponse.postCode;
      country_code = this.inCommingResponse.countryCode;
      gender = this.inCommingResponse.gender;
      date_of_birth = this.inCommingResponse.dateOfBirth;
      alt_phone = this.inCommingResponse.altPhone;
      email = this.inCommingResponse.email;
      comments = this.inCommingResponse.comments;
      vendorLeadCode = this.inCommingResponse.vendorLeadCode;
      securityPhrase = this.inCommingResponse.campaign;
    } else {
      leadId = this.manualDialCallResponse.leadId;
      phone = this.manualDialCallResponse.phoneCustomer;
      title = this.manualDialCallResponse.title;
      first_name = this.manualDialCallResponse.first;
      middle_initial = this.manualDialCallResponse.mi;
      last_name = this.manualDialCallResponse.last;
      address1 = this.manualDialCallResponse.address1;
      address2 = this.manualDialCallResponse.address2;
      address3 = this.manualDialCallResponse.address3;
      city = this.manualDialCallResponse.city;
      state = this.manualDialCallResponse.state;
      province = this.manualDialCallResponse.province;
      postal_code = this.manualDialCallResponse.postCode;
      country_code = this.manualDialCallResponse.countryCode;
      gender = this.manualDialCallResponse.gender;
      date_of_birth = this.manualDialCallResponse.dateOfBirth;
      alt_phone = this.manualDialCallResponse.altPhone;
      email = this.manualDialCallResponse.email;
      comments = this.manualDialCallResponse.comments;
      vendorLeadCode = this.manualDialCallResponse.vendor_lead_code;
      securityPhrase = this.manualDialCallResponse.show;
    }
    const params = {
      server_vicidial: this.cleanString(this.myVars.server_vicidial),
      server_ip: this.cleanString(this.myVars.server_ip),
      session_name: this.cleanString(this.myVars.session_name),
      user: this.cleanString(this.myVars.user),
      pass: this.cleanString(this.myVars.pass),
      campaign: this.cleanString(this.myVars.campaign),
      ACTION: 'updateLEAD',
      format: 'text',
      lead_id: leadId,
      vendor_lead_code: this.cleanString(vendorLeadCode), // se debe procesar de la respuesta del incoming
      phone_number: phone,
      title: title,
      first_name: first_name,
      middle_initial: middle_initial,
      last_name: last_name,
      address1: address1,
      address2: address2,
      address3: address3,
      city: city,
      state: state,
      province: province,
      postal_code: postal_code,
      country_code: country_code,
      gender: gender,
      date_of_birth: date_of_birth,
      alt_phone: alt_phone,
      email: email,
      security_phrase: this.cleanString(securityPhrase),
      comments: comments,
    };
    this.vicidialService.updateLead(params).subscribe((resp: any) => {
      // this.transferCloser(grupo);
    });
  }

  stateDTMF() {
    this.viewDTMF = !this.viewDTMF;
  }

  conectar() {
    this.vozState = 'conectado';
  }

  changeVozState(state) {
    this.vozState = state;
    if (state == 'logout') {
      this.logOut();
    }
    if (state == 'pause') {
      this.pause();
      this.currentPause = this.pauseOptions[1];
    }
  }

  viewPhone() {
    this.viewPhoneState = !this.viewPhoneState;
  }

  call() {
    this.vozState = 'incall';
  }

  hangUp(callInBound) {
    // this.clickHandler();
    if (this.subscribeIntervalConnected) {
      this.subscribeIntervalConnected.unsubscribe();
    }
    this.mm = 0;
    this.ss = 0;
    this.ms = 0;
    this.isRunning = false;
    this.timerId = 0;
    this.vozState = 'pause';

    if (this.subscribeIntervalPause) {
      this.subscribeIntervalPause.unsubscribe();
    }
    this.mmPause = 0;
    this.ssPause = 0;
    this.msPause = 0;
    this.isRunningPause = false;

    if (this.subscribeIntervalXfer) {
      this.subscribeIntervalXfer.unsubscribe();
    }
    this.mmXfer = 0;
    this.ssXfer = 0;
    this.msXfer = 0;
    this.isRunningXfer = false;

    if (this.subscribeIntervalPauseXfer) {
      this.subscribeIntervalPauseXfer.unsubscribe();
    }
    this.mmPauseXfer = 0;
    this.ssPauseXfer = 0;
    this.msPauseXfer = 0;
    this.isRunningPauseXfer = false;

    if (callInBound) {
      // Colgado de llamada entrante
      this.hangoutCustomerCall(callInBound);
    } else {
      // Caldago de llamada manual
      this.hangoutConfDialManual();
    }
    this.dataCallSumary = null;
  }

  logOut() {
    let pause = {
      key: 'offline',
    };

    this.vicidialService.registerPause(pause).subscribe((resp) => { });
    this.logoutAction = false;
    let params = {};
    if (this.myVars && this.myVars.server_vicidial) {
      params = {
        server_vicidial: this.cleanString(this.myVars.server_vicidial),
        server_ip: this.cleanString(this.myVars.server_ip),
        session_name: this.cleanString(this.myVars.session_name),
        ACTION: 'userLOGout',
        format: 'text',
        user: this.cleanString(this.myVars.user),
        pass: this.cleanString(this.myVars.pass),
        orig_pass: this.cleanString(this.myVars.pass),
        campaign: this.cleanString(this.myVars.campaign),
        conf_exten: this.cleanString(this.myVars.session_id),
        extension: this.cleanString(this.myVars.extension),
        protocol: this.cleanString(this.myVars.protocol),
        agent_log_id: this.cleanString(this.myVars.agent_log_id),
        no_delete_sessions: 1,
        phone_ip: '',
        enable_sipsak_messages: '0',
        LogouTKicKAlL: '1',
        ext_context: 'default',
        qm_extension: this.cleanString(this.myVars.extension),
        stage: 'NORMAL',
        pause_trigger: '',
        dial_method: 'RATIO',
      };
    }
    this.stendCheckRequest.unsubscribe();
    this.vicidialService.logout(params).subscribe(
      (resp: any) => {
        this.viewPhoneButton.emit(false);
        // this.stendCheckRequest.unsubscribe();
        if (this.inCommingRequest) this.inCommingRequest.unsubscribe();
        this.vicidialActive.emit(false);
        localStorage.removeItem('varsVicidial');
        this.ngOnDestroy();
        this.isLogin = false;
      },
      (error) => {
        // if(this.errorNetwork){
        this.viewPhoneButton.emit(false);
        this.stendCheckRequest.unsubscribe();
        if (this.inCommingRequest) this.inCommingRequest.unsubscribe();
        this.vicidialActive.emit(false);
        localStorage.removeItem('varsVicidial');
        // }
      }
    );
    this.viewPhone();
  }

  pause(key?) {
    const params = {
      server_vicidial: this.cleanString(this.myVars.server_vicidial),
      server_ip: this.cleanString(this.myVars.server_ip),
      session_name: this.cleanString(this.myVars.session_name),
      ACTION: 'VDADpause',
      user: this.cleanString(this.myVars.user),
      pass: this.cleanString(this.myVars.pass),
      stage: 'PAUSED',
      agent_log_id: this.cleanString(this.myVars.agent_log_id),
      agent_log: '',
      wrapup: '',
      campaign: this.cleanString(this.myVars.campaign),
      dial_method: this.cleanString(this.myVars.dial_method),
      comments: '',
      qm_extension: this.cleanString(this.myVars.extension),
    };
    this.vicidialService.setAgentStatus(params).subscribe((resp: any) => {
      this.vozState = 'pause';
      this.checkStatusLocal = 'PAUSED';
      this.setPauseCode(key);
      if (this.inCommingRequest) {
        this.inCommingRequest.unsubscribe();
      }
    });
  }

  setPauseCode(key?) {
    let statusPhone = key;
    if (key == 'training') {
      statusPhone = 'traini';
    }
    if (key == 'feedback') {
      statusPhone = 'feedba';
    }
    if (key == 'llamada-saliente') {
      statusPhone = 'llamad';
    }
    if (key == 'marcacion-manual') {
      statusPhone = 'marcac';
    }
    if (key == 'offline') {
      statusPhone = 'offlin';
    }
    if (key == 'pausa_activa') {
      statusPhone = 'pausa_';
    }
    if (key == 'pre-turno') {
      statusPhone = 'pre-tu';
    }
    if (key == 'break') {
      statusPhone = 'break';
    }
    if (key == 'banio') {
      statusPhone = 'banio';
    }
    if (key == 'Lunch') {
      statusPhone = 'Lunch';
    }
    if (key == 'acw') {
      statusPhone = 'acw';
    }
    if (key == null) {
      statusPhone = 'pre-tu';
      key = 'pre-turno';
    }

    const pause = {
      key: key,
    };

    this.vicidialService.registerPause(pause).subscribe((resp) => { });

    const params = {
      server_vicidial: this.cleanString(this.myVars.server_vicidial),
      server_ip: this.cleanString(this.myVars.server_ip),
      session_name: this.cleanString(this.myVars.session_name),
      user: this.cleanString(this.myVars.user),
      pass: this.cleanString(this.myVars.pass),
      ACTION: 'PauseCodeSubmit',
      format: 'text',
      status: statusPhone,
      agent_log_id: this.cleanString(this.myVars.agent_log_id),
      campaign: this.cleanString(this.myVars.campaign),
      extension: this.cleanString(this.myVars.extension),
      protocol: this.cleanString(this.myVars.protocol),
      phone_ip: '',
      enable_sipsak_messages: 0,
      stage: 0,
      campaign_cid: '',
      auto_dial_level: this.cleanString(this.myVars.auto_dial_level),
      MDnextCID: '',
    };

    this.vicidialService.setPauseCode(params).subscribe((resp: any) => { });
  }

  cleanString(entry) {
    return entry ? entry.replaceAll("'", '') : '';
  }

  ngOnDestroy(): void {
    this.destroyService.destroyComponent();
  }

  /**
   Esto solo funciona para algunos formularios, los formularios que manejen notificacions de lead por plataformas externas
   al recibir una llamada marcara el lead leido cuando vicidial detecte que la llamada se conecto con el cliente
   */
  makeNotificationLeadReaded() {
    this.formsRequestService
      .getData(`lead/notification/${this.formId}/${this.rrhhId}`)
      .subscribe((res) => {});
  }

  transferBlind() {
    let call_server_ip;

    if (this.inCommingResponse != null) {
      call_server_ip = this.inCommingResponse.serverIP;
    } else {
      call_server_ip = this.myVars.server_ip;
    }
    let phoneNumber = this.phone2;

    const params = {
      server_vicidial: this.cleanString(this.myVars.server_vicidial),
      server_ip: this.cleanString(this.myVars.server_ip),
      session_name: this.cleanString(this.myVars.session_name),
      user: this.cleanString(this.myVars.user),
      pass: this.cleanString(this.myVars.pass),
      ACTION: 'RedirectVD',
      format: 'text',
      channel: this.inCommingResponse.channel,
      call_server_ip: call_server_ip,
      queryCID:
        'XBvdcW' +
        this.cleanString(this.myVars.epoch_sec) +
        '' +
        this.cleanString(this.myVars.user_abb),
      exten: `123${phoneNumber}`,
      ext_context: 'default',
      ext_priority: '1',
      auto_dial_level: this.cleanString(this.myVars.auto_dial_level),
      campaign: this.cleanString(this.myVars.campaign),
      uniqueid: this.inCommingResponse.uniqueId,
      lead_id: this.inCommingResponse.leadId,
      secondS: this.ss,
      session_id: this.cleanString(this.myVars.session_id),
      CalLCID: this.inCommingResponse.mdNextCID,
      customerparked: 0,
    };
    this.vicidialService.transfer(params).subscribe((resp: any) => {
      this.hangout(true);
      // this.telephone = null;
      // this.phone2 = null;
      // this.inCommingResponse = null;
      // this.selectGroup();
    });
  }

  /**
   * Primero se envia la llamada principal al park y despues de inicia la marcacion xFer
   */
  parkCustomerDial() {
    this.parking();
    this.xfer3WayCallDial();
  }
  xfer3WayCallDial() {
    const phoneNumber = this.phone2;
    const params = {
      server_vicidial: this.cleanString(this.myVars.server_vicidial),
      server_ip: this.cleanString(this.myVars.server_ip),
      session_name: this.cleanString(this.myVars.session_name),
      user: this.cleanString(this.myVars.user),
      pass: this.cleanString(this.myVars.pass),
      ACTION: 'Originate',
      format: 'text',
      channel: `Local/123${phoneNumber}@default`,
      queryCID: this.getQueryCIDxFer(), //   ??????????????????????
      exten: this.cleanString(this.myVars.session_id),
      ext_context: 'default',
      ext_priority: 1,
      outbound_cid: this.cleanString(this.myVars.outbound_cid),
      usegroupalias: 0,
      preset_name: '',
      campaign: this.cleanString(this.myVars.campaign),
      account: '',
      agent_dialed_number: 1,
      agent_dialed_type: 'XFER_3WAY',
      lead_id: this.inCommingResponse.leadId,
      stage: 0,
      alertCID: 0,
      cid_lock: 0,
      session_id: this.cleanString(this.myVars.session_id),
      call_variables: `__vendor_lead_code=IVR_SOPORTE,__lead_id=${this.inCommingResponse.leadId}`, //IVR_SOPORTE ??????????????????
    };
    this.vicidialService.post('xfer/originate', params).subscribe((resp) => {
      this.beginCallTimexFer = new Date();
      this.dialLookCallXfer();
      this.callingXfer = true;
    });
  }
  dialLookCallXfer() {
    /**
     * Despues de ejecutar el api call que inicia el 3 way se ejecuta el manDialLookCall el cual seg a seg estara escuchando hasta que el
     * contacto atienda la llamada, en ese punto se reibe el canal y el uid de la llamada
     */
    this.timeInDiall = new Date();
    /**
    Si la marcacion manual tiene 30 o mas segundos sin recibir rspuesta se cancelan los intentos
    y se deja al agente nuevamente en pausa
    */
    if (
      this.timeInDiall.getTime() - this.beginCallTimexFer.getTime() >=
      60000
    ) {
      this.notificationService.alertInfo(
        'Estado de llamada',
        'Tiempo de marcación agotado'
      );
      this.callingXfer = false;
      this.manDiaLlookCaLLRequest.unsubscribe();
      throw new Error('Tiempo de marcación agotado');
    }

    const lookCallParams = {
      server_vicidial: this.cleanString(this.myVars.server_vicidial),
      server_ip: this.cleanString(this.myVars.server_ip),
      session_name: this.cleanString(this.myVars.session_name),
      ACTION: 'manDiaLlookCaLL',
      conf_exten: this.cleanString(this.myVars.session_id),
      user: this.cleanString(this.myVars.user),
      pass: this.cleanString(this.myVars.pass),
      MDnextCID: this.getQueryCIDxFer(),
      agent_log_id: this.cleanString(this.myVars.agent_log_id),
      lead_id: this.inCommingResponse.leadId,
      DiaL_SecondS: this.ss,
      stage: 'YES',
      campaign: this.cleanString(this.myVars.campaign),
      phone_number: this.telephone,
      routing_initiated_recording: this.cleanString(
        this.myVars.routing_initiated_recording
      ),
    };
    this.manDiaLlookCaLLRequest = this.vicidialService
      .manDialCallLookUp(lookCallParams)
      .pipe(delay(1000))
      .subscribe((resp: any) => {
        if (resp.data) {
          this.clickHandlerXfer();
          this.callingXfer = false;
          this.isTransfer = true;
          this.manDiaLlookCaLLRequest.unsubscribe();
          this.xferLookCallResponse = resp.data;
        } else {
          this.dialLookCallXfer();
        }
      });
  }

  set_length(SLnumber, SLlength_goal, SLdirection) {
    var sLnumber = SLnumber + '';
    var begin_point = 0;
    var number_length = sLnumber.length;
    if (number_length > SLlength_goal) {
      if (SLdirection == 'right') {
        begin_point = number_length - SLlength_goal;
        sLnumber = sLnumber.substr(begin_point, SLlength_goal);
      } else {
        sLnumber = sLnumber.substr(0, SLlength_goal);
      }
    }
    var result = sLnumber + '';
    while (result.length < SLlength_goal) {
      result = '0' + result;
    }
    return result;
  }

  getQueryCIDxFer() {
    let leadCID = this.inCommingResponse.leadId;
    let epochCID = this.myVars.epoch_sec;
    if (leadCID.length < 1) {
      leadCID = this.myVars.user_abb;
    }
    leadCID = this.set_length(leadCID, '10', 'left');
    epochCID = this.set_length(epochCID, '6', 'right');
    return 'DC' + epochCID + 'W' + leadCID + 'W';
  }

  hangupXFerCall() {
    const params = {
      server_vicidial: this.cleanString(this.myVars.server_vicidial),
      server_ip: this.cleanString(this.myVars.server_ip),
      session_name: this.cleanString(this.myVars.session_name),
      ACTION: 'Hangup',
      format: 'text',
      user: this.cleanString(this.myVars.user),
      pass: this.cleanString(this.myVars.pass),
      channel: this.xferLookCallResponse
        ? this.xferLookCallResponse.channel
        : '',
      queryCID:
        'HXvdcW' +
        this.cleanString(this.myVars.epoch_sec) +
        '' +
        this.cleanString(this.myVars.user_abb),
      log_campaign: this.cleanString(this.myVars.campaign),
      qm_extension: this.cleanString(this.myVars.extension),
    };
    this.vicidialService.post(`hangup`, params).subscribe((resp) => {
      if (this.subscribeIntervalXfer) {
        this.subscribeIntervalXfer.unsubscribe();
      }
      if (this.subscribeIntervalPauseXfer) {
        this.subscribeIntervalPauseXfer.unsubscribe();
      }
      this.mmXfer = 0;
      this.ssXfer = 0;
      this.mmPauseXfer = 0;
      this.ssPauseXfer = 0;
      this.msPauseXfer = 0;
      this.isRunningPauseXfer = false;
      this.callXferPause = false;
      this.phone2 = null;
      this.isTransfer = false;
      /**
       *
       *
       * AQUI VAN LAS REGLAS QUE DEFINAMOS
       *
       *
       *
       */
    });
  }

  parkCallXfer() {
    let call_server_ip;

    if (this.inCommingResponse != null) {
      call_server_ip = this.inCommingResponse.serverIP;
    } else {
      call_server_ip = this.myVars.server_ip;
    }
    const params = {
      server_vicidial: this.cleanString(this.myVars.server_vicidial),
      server_ip: this.cleanString(this.myVars.server_ip),
      session_name: this.cleanString(this.myVars.session_name),
      user: this.cleanString(this.myVars.user),
      pass: this.cleanString(this.myVars.pass),
      ACTION: 'RedirectToParkXfer',
      format: 'text',
      channel: this.xferLookCallResponse.channel,
      call_server_ip: call_server_ip,
      queryCID:
        'LXvdcW' +
        this.cleanString(this.myVars.epoch_sec) +
        '' +
        this.cleanString(this.myVars.user_abb),
      exten: this.cleanString(this.myVars.park_on_extension),
      ext_context: 'default',
      ext_priority: 1,
      extenName: 'park',
      parkedby: 'SIP/' + this.cleanString(this.myVars.extension),
      session_id: this.cleanString(this.myVars.session_id),
      CalLCID: this.getQueryCIDxFer(),
      uniqueid: this.xferLookCallResponse.uniqueId,
      lead_id: this.inCommingResponse.leadId,
      campaign: this.cleanString(this.myVars.campaign),
    };
    this.vicidialService.parking(params).subscribe((resp: any) => {
      this.clickHandlerPauseXfer();
      this.callXferPause = true;
      /***
       *
       *
       * AQUI VAN LAS REGLAS QUE DEFINAMOS
       *
       *
       *
       */
    });
  }

  recoveryCallXfer() {
    let call_server_ip;

    if (this.inCommingResponse != null) {
      call_server_ip = this.inCommingResponse.serverIP;
    } else {
      call_server_ip = this.myVars.server_ip;
    }
    const params = {
      server_vicidial: this.cleanString(this.myVars.server_vicidial),
      server_ip: this.cleanString(this.myVars.server_ip),
      session_name: this.cleanString(this.myVars.session_name),
      user: this.cleanString(this.myVars.user),
      pass: this.cleanString(this.myVars.pass),
      ACTION: 'RedirectFromParkXfer',
      format: 'text',
      channel: this.xferLookCallResponse.channel,
      call_server_ip: call_server_ip,
      queryCID:
        'FXvdcW' +
        this.cleanString(this.myVars.epoch_sec) +
        '' +
        this.cleanString(this.myVars.user_abb),
      exten: this.cleanString(this.myVars.session_id),
      ext_context: 'default',
      ext_priority: 1,
      session_id: this.cleanString(this.myVars.session_id),
      CalLCID: this.getQueryCIDxFer(),
      uniqueid: this.xferLookCallResponse.uniqueId,
      lead_id: this.inCommingResponse.leadId,
      campaign: this.cleanString(this.myVars.campaign),
    };

    this.vicidialService.parkingRecovery(params).subscribe((resp: any) => {
      this.subscribeIntervalPauseXfer.unsubscribe();
      this.mmPauseXfer = 0;
      this.ssPauseXfer = 0;
      this.msPauseXfer = 0;
      this.isRunningPauseXfer = false;
      this.callXferPause = false;
      /***
       *
       *
       * AQUI VAN LAS REGLAS QUE DEFINAMOS
       *
       *
       *
       */
    });
  }

  /**
   * Metodo que permite desconectarse del canal con los dos posibles clientes
   */
  redirectXTraNew() {
    let call_server_ip;

    if (this.inCommingResponse != null) {
      call_server_ip = this.inCommingResponse.serverIP;
    } else {
      call_server_ip = this.myVars.server_ip;
    }
    /**
     * CUANDO UNA LLAMADA ESTE EN EL PARKING
     */
    if (this.callPause) {
      this.recoveryParking();
    }

    let params = {
      server_vicidial: this.cleanString(this.myVars.server_vicidial),
      server_ip: this.cleanString(this.myVars.server_ip),
      session_name: this.cleanString(this.myVars.session_name),
      user: this.cleanString(this.myVars.user),
      pass: this.cleanString(this.myVars.pass),
      ACTION: 'RedirectXtraNeW',
      format: 'text',
      channel: this.inCommingResponse.channel,
      call_server_ip: call_server_ip,
      queryCID:
        'VXvdcW' +
        this.cleanString(this.myVars.epoch_sec) +
        '' +
        this.cleanString(this.myVars.user_abb),
      exten: 'NEXTAVAILABLE',
      ext_context: 'default',
      ext_priority: 1,
      extrachannel: this.xferLookCallResponse.channel,
      lead_id: this.inCommingResponse.leadId,
      phone_code: 1,
      phone_number: this.inCommingResponse.phoneCustomer,
      filename: 'FIRST',
      campaign: '6786678678', ///?????????????????????????????????????
      session_id: this.cleanString(this.myVars.session_id),
      agentchannel: this.configCheckResponse.agentChannel,
      protocol: this.cleanString(this.myVars.protocol),
      extension: this.cleanString(this.myVars.extension),
      auto_dial_level: this.cleanString(this.myVars.auto_dial_level),
      CalLCID: this.inCommingResponse.mdNextCID,
      customerparked: 0,
    };

    this.vicidialService
      .post(`xfer/redirectxtranew`, params)
      .subscribe((resp) => {
        if (this.subscribeIntervalXfer) {
          this.subscribeIntervalXfer.unsubscribe();
        }
        if (this.subscribeIntervalPauseXfer) {
          this.subscribeIntervalPauseXfer.unsubscribe();
        }
        this.mmXfer = 0;
        this.ssXfer = 0;
        this.mmPauseXfer = 0;
        this.ssPauseXfer = 0;
        this.msPauseXfer = 0;
        this.isRunningPauseXfer = false;
        this.callXferPause = false;
        this.phone2 = null;
        this.isTransfer = false;
        /**
         *
         *
         * AQUI VAN LAS REGLAS QUE DEFINAMOS
         *
         *
         *
         */
        this.hangout2(true, true);
      });
  }

  hangupBothCalls() {
    this.phone2 = null;
    this.hangupXFerCall();
    this.hangoutCustomerCall(true);
  }

  /**
   * DTMF
   */
  option = null;
  sendDTMF() {
    let channel = null;
    if (this.xferLookCallResponse) {
      channel = this.xferLookCallResponse.channel;
    } else if (this.manualDialCalLookUpResponse) {
      channel = this.manualDialCalLookUpResponse.channel;
    }

    if (!channel) {
      this.notificationService.alertInfo(
        'Estado de llamada',
        'Canal de Comunicación no identificado.'
      );
      this.option = null;
      throw new Error('Canal de Comunicación no identificado.');
    }

    // Parametros para pruebas, despues de confirmar borrar
    // *  @param server_vicidial (DNS de vicidial)
    // * @param server_ip: 172.10.7.98
    // * @param session_name: 1625665929_30300312359099
    // * @param user: 862925
    // * @param pass: 862925
    // * @param ACTION: SysCIDdtmfOriginate
    // * @param format: text
    // * @param channel: local/8500998@default
    // * @param queryCID: 1
    // * @param exten: 78600051
    // * @param ext_context: default
    // * @param ext_priority: 1
    let params = {
      server_vicidial: this.cleanString(this.myVars.server_vicidial),
      server_ip: this.cleanString(this.myVars.server_ip),
      session_name: this.cleanString(this.myVars.session_name),
      user: this.cleanString(this.myVars.user),
      pass: this.cleanString(this.myVars.pass),
      ACTION: 'SysCIDdtmfOriginate',
      format: 'text',
      channel: this.cleanString(this.myVars.dtmf_send_extension),
      queryCID: this.option,
      exten:
        this.cleanString(this.myVars.dtmf_silent_prefix) +
        this.cleanString(this.myVars.session_id),
      ext_priority: 1,
      ext_context: this.cleanString(this.myVars.ext_context),
    };
    this.vicidialService.post(`dtmf`, params).subscribe((resp) => {
      this.option = null;
      /**
       * Algunas reglas?
       */
    });
  }

  /**
   * Funcion que actualiza el estado de tipificacion en vicidial
   * @param Action:
   */
  updateDispo() {
    let leadId;
    let uniqueId;
    let mdNextCID;
    let listId = this.myVars.mdnLisT_id;
    let phoneNumber;
    let recordingFilename = this.cleanString(this.myVars.campaign_rec_filename);
    let recordingId;
    let exten;
    let confExten;
    let calledCount;
    let phoneCode;
    let stage;

    if (this.inCommingResponse != null) {
      leadId = this.inCommingResponse.leadId;
      uniqueId = this.inCommingResponse.uniqueId;
      mdNextCID = this.inCommingResponse.mdNextCID;
      phoneNumber = this.inCommingResponse.phoneCustomer;
      phoneCode = this.inCommingResponse.dialCode;
      listId = this.inCommingResponse.listId;
      stage = this.inCommingResponse.campaign;
    }
    if (this.manualDialCallResponse != null) {
      leadId = this.manualDialCallResponse.leadId;
      uniqueId = this.manualDialCalLookUpResponse ? this.manualDialCalLookUpResponse.uid : '';
      mdNextCID = this.manualDialCallResponse.mdNextCID;
      listId = this.manualDialCallResponse.listId;
      phoneNumber = this.manualDialCallResponse.phoneCustomer;
      calledCount = this.manualDialCallResponse.called_count;
      phoneCode = this.manualDialCallResponse.dialCode;
    }

    if (this.manDiaLlogCallEndResponse != null) {
      recordingFilename = this.manDiaLlogCallEndResponse.recording_filename;
      exten = this.manDiaLlogCallEndResponse.exten;
      confExten = this.manDiaLlogCallEndResponse.conf_exten;
      recordingId = this.manDiaLlogCallEndResponse.recording_id;
      calledCount = '1';
    }
    if (this.telephone) {
      phoneNumber = this.telephone;
      phoneCode = '1';
    }
    const params = {
      server_vicidial: this.cleanString(this.myVars.server_vicidial),
      server_ip: this.cleanString(this.myVars.server_ip),
      session_name: this.cleanString(this.myVars.session_name),
      ACTION: 'updateDISPO',
      format: 'text',
      user: this.cleanString(this.myVars.user),
      pass: this.cleanString(this.myVars.pass),
      orig_pass: this.cleanString(this.myVars.pass),
      dispo_choice: 'MIOS',
      lead_id: leadId,
      campaign: this.cleanString(this.myVars.campaign),
      auto_dial_level: this.cleanString(this.myVars.auto_dial_level),
      agent_log_id: this.cleanString(this.myVars.agent_log_id),
      CallBackDatETimE: '',
      list_id: listId,
      recipient: '',
      use_internal_dnc: this.cleanString(this.myVars.use_internal_dnc),
      use_campaign_dnc: this.cleanString(this.myVars.use_campaign_dnc),
      MDnextCID: mdNextCID,
      stage: stage ?? this.cleanString(this.myVars.campaign),
      vtiger_callback_id: this.cleanString(this.myVars.vtiger_callback_id),
      phone_number: phoneNumber,
      phone_code: '1',
      dial_method: this.cleanString(this.myVars.dial_method),
      uniqueid: uniqueId,
      CallBackLeadStatus: '',
      comments: '',
      custom_field_names: '|',
      call_notes: '',
      dispo_comments: '',
      cbcomment_comments: '',
      qm_dispo_code: '',
      email_enabled: 0,
      recording_id: recordingId,
      recording_filename: recordingFilename,
      called_count: calledCount ?? '1',
      parked_hangup: 0,
      phone_login: this.cleanString(this.myVars.phone_login),
      agent_email: '',
      conf_exten: confExten,
      camp_script: '',
      in_script: '',
      customer_server_ip: '',
      exten: exten,
      original_phone_login: this.cleanString(this.myVars.original_phone_login),
      phone_pass: this.cleanString(this.myVars.phone_pass),
      callback_gmt_offset: '',
      callback_timezone: '',
      customer_sec: 0,
    };
    this.vicidialService.updateDispo(params).subscribe((resp: any) => {
      this.clearVariables();
      /***
       *
       *
       * AQUI VAN LAS REGLAS QUE DEFINAMOS
       *
       *
       *
       */
    });
  }

  clearVariables() {
    this.manualDialCalLookUpResponse = null;
    this.inCommingResponse = null;
    this.manualDialCallResponse = null;
  }

  requestCall() {
    this.manDialNextCall();
  }

  manDialNextCall() {
    // Peticion de lista, Marcacion Manual
    this.joinToCall();
    this.callInBound = false;
    this.disableHangout = true;
    this.manualDialCalLookUpResponse = null;
    this.tryLookCallAgain = true;
    const params = {
      server_vicidial: this.cleanString(this.myVars.server_vicidial),
      server_ip: this.cleanString(this.myVars.server_ip),
      session_name: this.cleanString(this.myVars.session_name),
      ACTION: 'manDiaLnextCaLL',
      conf_exten: this.cleanString(this.myVars.session_id),
      user: this.cleanString(this.myVars.user),
      pass: this.cleanString(this.myVars.pass),
      campaign: this.cleanString(this.myVars.campaign),
      ext_context: 'default',
      dial_timeout: this.cleanString(this.myVars.dial_timeout),
      dial_prefix: this.cleanString(this.myVars.dial_prefix),
      campaign_cid: this.cleanString(this.myVars.campaign_cid),
      preview: 'NO',
      agent_log_id: this.cleanString(this.myVars.agent_log_id),
      callback_id: '',
      lead_id: '',
      phone_code: '',
      phone_number: '',
      list_id: this.cleanString(this.myVars.mdnLisT_id),
      stage: '',
      use_internal_dnc: this.cleanString(this.myVars.use_internal_dnc),
      use_campaign_dnc: this.cleanString(this.myVars.use_campaign_dnc),
      omit_phone_code: this.cleanString(this.myVars.omit_phone_code),
      manual_dial_filter: this.cleanString(this.myVars.manual_dial_filter),
      manual_dial_search_filter: this.cleanString(
        this.myVars.manual_dial_search_filter
      ),
      vendor_lead_code: '0',
      usegroupalias: '',
      account: '',
      agent_dialed_number: '',
      agent_dialed_type: '',
      vtiger_callback_id: this.cleanString(this.myVars.vtiger_callback_id),
      dial_method: this.cleanString(this.myVars.dial_method),
      manual_dial_call_time_check: this.cleanString(
        this.myVars.manual_dial_call_time_check
      ),
      qm_extension: this.cleanString(this.myVars.extension),
      dial_ingroup: '',
      nocall_dial_flag: this.cleanString(this.myVars.nocall_dial_flag),
      cid_lock: this.cleanString(this.myVars.cid_lock),
      last_VDRP_stage: 'PAUSED',
      routing_initiated_recording: this.cleanString(
        this.myVars.routing_initiated_recording
      ),
      exten: this.cleanString(this.myVars.recording_exten),
      recording_filename: this.cleanString(this.myVars.campaign_rec_filename),
      channel:
        'Local/5' + this.cleanString(this.myVars.session_id) + '@default', // Se debe sacar de la respuesta del check config
      manual_dial_validation: this.cleanString(
        this.myVars.manual_dial_validation
      ),
      phone_login: this.cleanString(this.myVars.phone_login),
    };
    this.vicidialService.manDialCall(params).subscribe((resp: any) => {
      if (resp.data.mdNextCID !== 'HOPPER EMPTY') {
        this.vozState = 'incall';
        this.manualDialCallResponse = resp.data;
        this.beginManualDialgCall = new Date();
        this.vicidialService.setCallResponse({
          address1: resp.data.address1 ? resp.data.address1 : null,
          address2: resp.data.address2 ? resp.data.address2 : null,
          address3: resp.data.address3 ? resp.data.address3 : null,
          altPhone: resp.data.altPhone ? resp.data.altPhone : null,
          city: resp.data.city ? resp.data.city : null,
          comments: resp.data.comments ? resp.data.comments : null,
          countryCode: resp.data.countryCode ? resp.data.countryCode : null,
          dateOfBirth: resp.data.dateOfBirth ? resp.data.dateOfBirth : null,
          email: resp.data.email ? resp.data.email : null,
          first: resp.data.first ? resp.data.first : null,
          gender: resp.data.gender ? resp.data.gender : null,
          ivrSelected: resp.data.ivrSelected ? resp.data.ivrSelected : null,
          last: resp.data.last ? resp.data.last : null,
          leadId: resp.data.leadId,
          phoneCustomer: resp.data.phoneCustomer,
          documentType: resp.data.documentType
            ? resp.data.documentType
            : null,
          documentNumber: resp.data.documentNumber
            ? resp.data.documentNumber
            : null,
          uid: resp.data.uniqueId,
          cui: resp.data.mdNextCID,
          postCode: resp.data.postCode ? resp.data.postCode : null,
          province: resp.data.province ? resp.data.province : null,
          state: resp.data.state ? resp.data.state : null,
          tittle: resp.data.tittle ? resp.data.tittle : null,
        });
        this.callResponse.emit({
          address1: resp.data.address1 ? resp.data.address1 : null,
          address2: resp.data.address2 ? resp.data.address2 : null,
          address3: resp.data.address3 ? resp.data.address3 : null,
          altPhone: resp.data.altPhone ? resp.data.altPhone : null,
          city: resp.data.city ? resp.data.city : null,
          comments: resp.data.comments ? resp.data.comments : null,
          countryCode: resp.data.countryCode ? resp.data.countryCode : null,
          dateOfBirth: resp.data.dateOfBirth ? resp.data.dateOfBirth : null,
          email: resp.data.email ? resp.data.email : null,
          first: resp.data.first ? resp.data.first : null,
          gender: resp.data.gender ? resp.data.gender : null,
          ivrSelected: resp.data.ivrSelected ? resp.data.ivrSelected : null,
          last: resp.data.last ? resp.data.last : null,
          leadId: resp.data.leadId,
          phoneCustomer: resp.data.phoneCustomer,
          documentType: resp.data.documentType
            ? resp.data.documentType
            : null,
          documentNumber: resp.data.documentNumber
            ? resp.data.documentNumber
            : null,
          uid: resp.data.uniqueId,
          cui: resp.data.mdNextCID,
          postCode: resp.data.postCode ? resp.data.postCode : null,
          province: resp.data.province ? resp.data.province : null,
          state: resp.data.state ? resp.data.state : null,
          tittle: resp.data.tittle ? resp.data.tittle : null,
        });
        this.manDiaLlookCaLL();
        this.monitorConf();
      } else {
        this.alertsService.alertInfo(
          'Solicitud no procesada',
          'Hopper de marcacion vacio'
        );
      }
    });
  }

  rpa() {
    if (this.inCommingResponse != null) {
      this.vicidialService.setStatusRPA(true, this.inCommingResponse.uniqueId);
    } else {
      this.vicidialService.setStatusRPA(
        true,
        this.manualDialCalLookUpResponse.uid
      );
    }
  }

  vdRelogin() {
    let params = {
      server_vicidial: this.cleanString(this.myVars.server_vicidial),
      server_ip: this.cleanString(this.myVars.server_ip),
      session_name: this.cleanString(this.myVars.session_name),
      user: this.cleanString(this.myVars.user),
      pass: this.cleanString(this.myVars.pass),
      ACTION: 'OriginateVDRelogin',
      format: 'text',
      channel: 'SIP/' + this.cleanString(this.myVars.extension),
      queryCID:
        'ACagcW' +
        this.cleanString(this.myVars.epoch_sec) +
        '' +
        this.cleanString(this.myVars.user_abb),
      exten: this.cleanString(this.myVars.session_id),
      ext_context: 'default',
      ext_priority: 1,
      extension: this.cleanString(this.myVars.extension),
      protocol: this.cleanString(this.myVars.protocol),
      phone_ip: this.cleanString(this.myVars.phone_ip),
      enable_sipsak_messages: 0,
      allow_sipsak_messages: 0,
      campaign: this.cleanString(this.myVars.campaign),
      outbound_cid: this.cleanString(this.myVars.outbound_cid),
    };
    this.vicidialService.vdRelogin(params).subscribe((resp: any) => { });
  }


}
