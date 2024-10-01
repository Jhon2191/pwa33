import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { speedDialFabAnimations } from './speed-dial-fab.animations';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';
import { VicidialService } from 'src/app/components/vicidial-voz/services/vicidial.service';


@Component({
	selector: 'app-speed-dial-fab',
	templateUrl: './speed-dial-fab.component.html',
	styleUrls: ['./speed-dial-fab.component.sass'],
	animations: speedDialFabAnimations
})
export class SpeedDialFabComponent implements OnInit {
	rol: any;
	pqrs: any;
	historial = false;
	options: any = false;
	email: any = false;
	voz = true;
	vozButton = false;
	viewPhoneState = false;
	groups = ['Grupo 1', 'Grupo 2', 'Grupo 3'];

	chat: any = false;

	buttons = [];
	fabTogglerState = 'inactive';
	@Output() vicidialActive = new EventEmitter<boolean>();
	@Output() callResponse = new EventEmitter<any>();
	// @Input() campaignId;
	@Input()
	public set campaignId(campaignId: number) {
		this.campaignId = 0;
		if (campaignId !== undefined) {
			this.campaignId = campaignId;
		} else {
			this.campaignId = 0;
		}
	}

	videoLlamada: boolean = false;
	VideollamadaButton: boolean = false;
	stateMinimizeModalRPA: boolean = false;
	stateOpenModal = {
		status: false,
		uid: null
	};
	constructor(public dialog: MatDialog, public authService: AuthService, public vicidialService: VicidialService) {
		// this.getRolUser();

		// @Input() options;
		this.options = {
			buttons: [
				{
					icon: 'fi-sr-envelope',
					label: 'Email',
					key: 'email',
					permiso: this.email
				},
				{
					icon: 'fi-sr-shuffle',
					label: 'Escalamiento',
					key: 'escala',
					permiso: this.pqrs
				},
				{
					icon: 'fi-rr-comment',
					label: 'Chat',
					key: 'chat',
					permiso: this.chat
				},
				{
					icon: 'phone',
					label: 'Voz',
					key: 'voz',
					permiso: this.voz
				},
				{
					icon: 'fi-rr-video-camera',
					label: 'Videollamada',
					key: 'video_llamada',
					permiso: this.videoLlamada
				},
				{
					icon: 'fi-rr-comment',
					label: 'Chat SOUL',
					key: 'chat_soul',
					permiso: true
				},
			]
		};
	}

	ngOnInit() {
		const maxButtons = 6;
		if (this.options.buttons.length > maxButtons) {
			this.options.buttons.splice(5, this.options.buttons.length - maxButtons);
		}
		this.vicidialService.statusRPAObservable.subscribe((resp: any) => {
			this.stateOpenModal = resp;
			console.log(resp);
		});
	}

	disabledBtnBack = false;
	changeVicidialArg(event) {
		this.disabledBtnBack = event;
		this.vicidialActive.emit(event);
	}

	processCallResponse(event) {
		this.callResponse.emit(event);
	}

	getRolUser(): void {
		const user = this.authService.decryptToken();
		const local = this.authService.getUser();
		local.roles.forEach((rol) => {
			const name = rol.split('::');
			if (name[0] === 'pqrs') {
				this.rol = name[1];
				this.pqrs = true;
			}
			if (name[1] === 'mailcore') {
				this.email = true;
			}
			if (local.chat_active === 1) {
				this.chat = true;
			}
			if (name[1] === 'meetings') {
				this.videoLlamada = true;
			}
		});
	}

	showItems() {
		this.fabTogglerState = 'active';
		this.buttons = this.options.buttons;
	}

	hideItems() {
		this.fabTogglerState = 'inactive';
		this.buttons = [];
	}

	onToggleFab() {
		this.buttons.length ? this.hideItems() : this.showItems();
	}

	ocultarChat() {
		this.historial = !this.historial;
	}

	/**
	 * @author Daniel Martinez
	 * @createdate 2021-03-10
	 * Metodo que se encarga de direccionar a cada integracion
	 * @param key key de cada integracion
	 */
	funcionalidad(key: any): void {
		switch (key) {
			case 'chat': {
				this.historial = true;
				break;
			}
			case 'voz': {
				this.vozButton = true;
        break;
			}
			case 'video_llamada': {
				this.VideollamadaButton = true;
				break;
			}
		}
	}

	changeViewPhone(bool) {
		this.vozButton = bool;
		this.onToggleFab();
	}

	changeViewVideo(bool) {
		this.VideollamadaButton = bool;
		this.onToggleFab();
	}

	/**
	 * Identifica el evento de minimizar o cerrrar el modal
	 * @param data:any {any} valor emitido desde el modal para identificar las acciones del modal
	*/
	modifyModal(data: any) {
		if (data.action == 'minimize') {
			this.stateMinimizeModalRPA = true
		} else {
			this.stateMinimizeModalRPA = false
		}

		if (data.action == 'close') {
			this.stateOpenModal = { status: false, uid: null };
		}
	}
}
