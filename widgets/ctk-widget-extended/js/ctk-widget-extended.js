/*
	ioBroker.vis ctk-widget-extended Widget-Set

	version: "0.0.1"

	Copyright 2022 HCPSMW sebastian.wien@ctk-gmbh.de
*/
"use strict";

/* global $, vis, systemDictionary */

// add translations for edit mode
$.extend(true, systemDictionary, {
	// Add your translations here, e.g.:
	// "size": {
	// 	"en": "Size",
	// 	"de": "Größe",
	// 	"ru": "Размер",
	// 	"pt": "Tamanho",
	// 	"nl": "Grootte",
	// 	"fr": "Taille",
	// 	"it": "Dimensione",
	// 	"es": "Talla",
	// 	"pl": "Rozmiar",
	// 	"zh-cn": "尺寸"
	// }
});

// this code can be placed directly in ctk-widget-extended.html
vis.binds["ctk-widget-extended"] = {
	version: "0.0.3",
	showVersion: function () {
		if (vis.binds["ctk-widget-extended"].version) {
			console.log("Version ctk-widget-extended: " + vis.binds["ctk-widget-extended"].version);
			vis.binds["ctk-widget-extended"].version = null;
		}
	},
	createWidget: function (widgetID, view, data, style) {
		var $div = $("#" + widgetID);
		// if nothing found => wait
		if (!$div.length) {
			return setTimeout(function () {
				vis.binds["ctk-widget-extended"].createWidget(widgetID, view, data, style);
			}, 100);
		}

		var text = "";
		text += "OID: " + data.oid + "</div><br>";
		text += 'OID value: <span class="ctk-widget-extended-value">' + vis.states[data.oid + ".val"] + "</span><br>";
		text += 'Color: <span style="color: ' + data.myColor + '">' + data.myColor + "</span><br>";
		text += "extraAttr: " + data.extraAttr + "<br>";
		text += "Browser instance: " + vis.instance + "<br>";
		text += 'htmlText: <textarea readonly style="width:100%">' + (data.htmlText || "") + "</textarea><br>";
		text += "htmlText2: <span>aas" + (data.htmlText || "") + "</span><br>";

		$("#" + widgetID).html(text);

		// subscribe on updates of value
		function onChange(e, newVal, oldVal) {
			$div.find(".template-value").html(newVal);
		}
		if (data.oid) {
			vis.states.bind(data.oid + ".val", onChange);
			//remember bound state that vis can release if didnt needed
			$div.data("bound", [data.oid + ".val"]);
			//remember onchange handler to release bound states
			$div.data("bindHandler", onChange);
		}
	},
};
vis.binds["ctk-widget-extended"].showVersion();

// Import stylesheets
// import './style.css';

//#region LIST
class List {
	//Initialize the list
	constructor() {
		this.listSize = 0;
		this.pos = 0;
		this.items = [];
	}

	//Add item to list
	append = (element) => {
		this.items[this.listSize++] = element;
	};

	//Find item in the list
	find = (element) => {
		if (typeof element === "object" && element !== null) {
			for (let i = 0; i < this.listSize; i++) {
				if (Object.entries(this.items[i]).toString() === Object.entries(element).toString()) {
					return i;
				}
			}
		} else {
			for (let i = 0; i < this.listSize; i++) {
				if (this.items[i] === element) {
					return i;
				}
			}
		}
		return -1;
	};

	//Remove item from the list
	remove = (element) => {
		let index = this.find(element);

		if (index > -1) {
			this.items.splice(index, 1);
			--this.listSize;
			return true;
		}

		return false;
	};

	//Insert item at specific position in the list
	insert = (element, after) => {
		let insertPos = this.find(after);

		if (insertPos > -1) {
			this.items.splice(insertPos + 1, 0, element);
			++this.listSize;
			return true;
		}

		return false;
	};

	//Check if items is there in list
	contains = (element) => {
		let index = this.find(element);
		return index > -1 ? true : false;
	};

	//Move to the front of the list
	front = () => {
		this.pos = 0;
	};

	//Move to the end of the list
	rear = () => {
		this.pos = this.listSize - 1;
	};

	//Move to the prev item in the list
	prev = () => {
		if (this.pos > 0) {
			--this.pos;
		}
	};

	//Move to the next item in the list
	next = () => {
		if (this.pos < this.listSize - 1) {
			++this.pos;
		}
	};

	//Return the currentPos in the list
	currPos = () => {
		return this.pos;
	};

	//Move to any particular position in the list
	moveTo = (pos) => {
		if (pos > 0 && pos <= this.listSize) {
			this.pos = pos - 1;
		}
	};

	//Get the current element in the list
	getElement = () => {
		return this.items[this.pos];
	};

	//Size of the list
	size = () => {
		return this.listSize;
	};

	//Print the list
	print = () => {
		return this.items.join(",");
	};

	//Clear the list
	clear = () => {
		this.listSize = 0;
		this.pos = 0;
		this.items = [];
	};
}
//#endregion

function createEnum(values) {
	const enumObject = {};
	for (const val of values) {
		enumObject[val] = val;
	}
	return Object.freeze(enumObject);
}

// { Up: 'Up', louvre: 'louvre', Left: 'Left', Right: 'Right' }
let enumy = createEnum(["up", "down", "light", "louvre", "room"]);
let temperaturenumy = createEnum(["sollTemp", "istTemp"]);

//#region classes
class Light {
	constructor(id, name, roomid) {
		this.id = id;
		this.name = name;
		this.roomid = roomid;
	}
}
class RoomMod {
	constructor(id, name, types = enumy.light, louvreinfo = "", lights = null, louvres = null) {
		this.id = id;
		this.name = name;
		this.type = types;
		if (lights == null) this.lights = null;
		else this.lights = lights;

		if (louvres == null) this.louvres = null;
		else this.louvres = louvres;

		if (types == enumy.louvre) this.louvresource = louvreinfo;
	}
}

class Louvre {
	constructor(id, name, roomid) {
		this.id = id;
		this.name = name;
		this.roomid = roomid;
	}
}

class Temperatur {
	constructor(raumid, id, ioadress, bsolltemp = false) {
		this.raumid = raumid;
		this.id = id;
		this.ioadress = ioadress;
		this.bsolltemp = bsolltemp;
	}
}
class TempCollection {
	constructor(roomid, istTempProp, sollTempProp) {
		this.roomid = roomid;
		this.istTempProp = istTempProp;
		this.sollTempProp = sollTempProp;
	}
}

//#endregion

// Write Javascript code!

const ids = ["R0", "R1", "R2", "R3"];
const names = ["Outdoor", "R001", "R002", "R003"];

let roomlist = new List();
roomlist.append(new RoomMod(ids[0], names[0], enumy.room));
roomlist.append(new RoomMod(ids[1], names[1], enumy.room));
roomlist.append(new RoomMod(ids[2], names[2], enumy.room));
roomlist.append(new RoomMod(ids[3], names[3], enumy.room));

let lightlist = new List();
lightlist.append(new Light("modbus.01", "Schalter 1", ids[0]));
lightlist.append(new Light("modbus.02", "Schalter 2", ids[0]));
lightlist.append(new Light("modbus.03", "Schalter 1", ids[1]));
lightlist.append(new Light("modbus.04", "Schalter 2", ids[1]));
lightlist.append(new Light("modbus.05", "Schalter 3", ids[1]));
lightlist.append(new Light("modbus.06", "Schalter 1", ids[2]));
lightlist.append(new Light("modbus.07", "Schalter 2", ids[2]));
lightlist.append(new Light("modbus.08", "Schalter 3", ids[2]));
lightlist.append(new Light("modbus.09", "Schalter 4", ids[2]));
lightlist.append(new Light("modbus.10", "Schalter 5", ids[2]));
lightlist.append(new Light("modbus.14", "Schalter 6", ids[2]));
lightlist.append(new Light("modbus.11", "Schalter 1", ids[3]));
lightlist.append(new Light("modbus.12", "Schalter 2", ids[3]));
lightlist.append(new Light("modbus.13", "Schalter 3", ids[3]));

let louvrelist = new List();
louvrelist.append(new Louvre("modbus.01", "Schalter 1", ids[0]));
louvrelist.append(new Louvre("modbus.02", "Schalter 2", ids[0]));
louvrelist.append(new Louvre("modbus.03", "Schalter 1", ids[1]));
louvrelist.append(new Louvre("modbus.04", "Schalter 2", ids[1]));
louvrelist.append(new Louvre("modbus.05", "Schalter 3", ids[1]));
louvrelist.append(new Louvre("modbus.06", "Schalter 1", ids[2]));
louvrelist.append(new Louvre("modbus.07", "Schalter 2", ids[2]));
louvrelist.append(new Louvre("modbus.08", "Schalter 1", ids[3]));
louvrelist.append(new Louvre("modbus.09", "Schalter 2", ids[3]));

let temperaturliste = new List();
let a = 0;
for (let inde = 0; inde > ids.length; inde++) {
	temperaturliste.append(
		new Temperatur(ids[inde].toString(), a++, "modbus.1.holdingregisters.2911" + a + "_temp" + a, false),
	);
	temperaturliste.append(
		new Temperatur(ids[inde].toString(), a++, "modbus.1.holdingregisters.2911" + a + "_temp" + a, true),
	);
}
let tempcollectionlist = new List();
ids.forEach((element) => {
	tempcollectionlist.append(
		new TempCollection(
			element,
			temperaturliste.items.filter((x) => x.raumid == element.toString())[0],
			temperaturliste.items.filter((x) => x.raumid == element.toString() && x.bsolltemp == true),
		),
	);
});
///////
const maintemplate = `
  <svg
    id="templateelement"
    xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  class="RoomlistKomponent"
  viewBox="0 0 356 183"
  >
  <defs>
    <filter
      id="Pfad_4"
      x="0"
      y="0"
      width="356"
      height="183"
      filterUnits="userSpaceOnUse"
    >
      <feOffset dy="3" input="SourceAlpha"></feOffset>
      <feGaussianBlur stdDeviation="5.5" result="blur"></feGaussianBlur>
      <feFlood flood-color="#0a4da2" flood-opacity="0.059"></feFlood>
      <feComposite operator="in" in2="blur"></feComposite>
      <feComposite in="SourceGraphic"></feComposite>
    </filter>
    <clipPath id="clip-path">
      <rect width="221" height="30" fill="none"></rect>
    </clipPath>
  </defs>
  <g
    id="Komponente_55_3"
    data-name="Komponente 55 – 3"
    transform="translate(16.5 13.5)"
  >
    <g id="Big_BOX" data-name="Big BOX">
      <g transform="matrix(1, 0, 0, 1, 0, 0)" filter="url(#Pfad_4)">
        <path
          id="Pfad_4-2"
          data-name="Pfad 4"
          d="M25,0H298a25,25,0,0,1,25,25V125a25,25,0,0,1-25,25H25A25,25,0,0,1,0,125V25A25,25,0,0,1,25,0Z"
          style="fill: white !important"
        ></path>
      </g>
      <g
        id="TEXT_WITH_ICON"
        data-name="TEXT WITH ICON"
        transform="translate(21 21.284)"
      >
        <g id="Text_info_group" data-name="Gruppe 77" transform="translate(0 48)">

          <text
            id="Countings_Group"
            data-name="1 Light 3 Louvres"
            transform="translate(0 42.431)"
            fill="#ffa939"
            font-size="12"
            font-family="SegoeUI-Bold, Segoe UI"
            font-weight="700"
          >
            <tspan id="Light_label" x="0" y="0">1 Light</tspan>
            <tspan id="Louvre_label" x="0" y="14">3 Louvres</tspan>
          </text>
        </g>
        <g id="ICON">
          <rect
            id="Rechteck_7"
            data-name="Rechteck 7"
            width="5.5"
            height="9.6"
            transform="translate(35.9 6.9)"
            fill="#f05540"
          ></rect>
          <rect
            id="Rechteck_8"
            data-name="Rechteck 8"
            width="9.7"
            height="5.2"
            transform="translate(33.8 2)"
            fill="#f3705a"
          ></rect>
          <path
            id="Pfad_96"
            data-name="Pfad 96"
            d="M44.8,86.8v22.1H84V86.8L64.4,67.2h0C56.8,74.9,52.5,79.2,44.8,86.8Z"
            transform="translate(-40.6 -60.9)"
            fill="#ffd15c"
          ></path>
          <path
            id="Pfad_97"
            data-name="Pfad 97"
            d="M84.1,86.8,64.5,67.2C60.6,71,57.6,74,54.6,77l-9.8,9.8v4.5L64.4,71.7,84,91.3v.6h0V86.8Z"
            transform="translate(-40.6 -60.9)"
            fill="#f7b64c"
          ></path>
          <path
            id="Pfad_98"
            data-name="Pfad 98"
            d="M102.467,342.834h-11.8v-11.6a5.911,5.911,0,0,1,5.9-5.9h0a5.911,5.911,0,0,1,5.9,5.9Z"
            transform="translate(-82.167 -294.834)"
            fill="#415a6b"
          ></path>
          <rect
            id="Rechteck_9"
            data-name="Rechteck 9"
            width="15.4"
            height="13.5"
            transform="translate(23.8 30.5)"
            fill="#344a5e"
          ></rect>
          <g
            id="Gruppe_14"
            data-name="Gruppe 14"
            transform="translate(25.4 32.1)"
          >
            <rect
              id="Rechteck_10"
              data-name="Rechteck 10"
              width="5.3"
              height="10.3"
              fill="#8ad7f8"
            ></rect>
            <rect
              id="Rechteck_11"
              data-name="Rechteck 11"
              width="5.3"
              height="10.3"
              transform="translate(6.9)"
              fill="#8ad7f8"
            ></rect>
          </g>
          <path
            id="Pfad_99"
            data-name="Pfad 99"
            d="M47.1,21.8,26.2.9a3.262,3.262,0,0,0-4.5,0L.9,21.8a3.262,3.262,0,0,0,0,4.5,3.263,3.263,0,0,0,4.5,0L24,7.7,42.6,26.3a3.182,3.182,0,1,0,4.5-4.5Z"
            transform="translate(0 0)"
            fill="#f3705a"
          ></path>
        </g>
      </g>
      <g
        id="Louvres_buttons_group"
        data-name="Wiederholungsraster 5"
        transform="translate(94 99)"
        clip-path="url(#clip-path)"
      >
        
      </g>
          

   <g
        id="Light_buttons_group"
        data-name="Wiederholungsraster 2"
        transform="translate(94 44)"
        clip-path="url(#clip-path)"
      >

        
      </g>

      <g id="Plus_minus" data-name="Plus minus" transform="translate(208)">
        <g
          id="Rechteck_8-2"
          data-name="Rechteck 8"
          transform="translate(0 5)"
          fill="#b4b3b3"
          stroke="#707070"
          stroke-width="1"
        >
          <rect width="30" height="30" stroke="none"></rect>
          <rect x="0.5" y="0.5" width="29" height="29" fill="none"></rect>
        </g>
        <text
          id="_"
          data-name="+"
          transform="translate(8)"
          font-size="30"
          font-family="RobotoMono-Regular, Roboto Mono"
          letter-spacing="0.03em"
        >
          <tspan x="0" y="31">+</tspan>
        </text>
      </g>
      <g id="Plus_minus-2" data-name="Plus minus" transform="translate(94 0)">
        <g
          id="Rechteck_8-3"
          data-name="Rechteck 8"
          transform="translate(0 4.8)"
          fill="#b4b3b3"
          stroke="#707070"
          stroke-width="1"
        >
          <rect width="30" height="30" stroke="none"></rect>
          <rect x="0.5" y="0.5" width="29" height="29" fill="none"></rect>
        </g>
        <text
          id="_-"
          data-name="-"
          transform="translate(8)"
          font-size="30"
          font-family="RobotoMono-Regular, Roboto Mono"
          letter-spacing="0.03em"
          style="text-position"
        >
          <tspan x="0" y="31">-</tspan>
        </text>
      </g>
      <g id="Temp" transform="translate(141 2)">
        <text
          id="Aktuell_21_4_C"
          data-name=""
          transform="translate(0 15)"
          fill="red"
          font-size="14"
          font-family="RobotoMono-Bold, Roboto Mono"
          font-weight="700"
          letter-spacing="0.03em"
        >
          <tspan x="0" y="0">Aktuell</tspan>
          <tspan x="0" y="19">21,4&deg;C</tspan>
        </text>
      </g>
      
    </g>
    </g>
    </svg>
  `;

///////
const LightHTML = `
  <g id="Light_Box" transform="translate(-89 -21)">
    <g id="ON_OFF" data-name="ON OFF" transform="translate(89 21)">
      <g id="Rechteck_6" data-name="Rechteck 6" fill="#1f0" stroke="#000" stroke-width="0.75">
        <rect width="30" height="30" stroke="none"></rect>
        <rect x="0.375" y="0.375" width="29.25" height="29.25" fill="none"></rect>
      </g>
      <text id="state" transform="translate(15 21)" stroke="rgba(0,0,0,0)" stroke-width="1" font-size="15" font-family="RobotoMono-Medium, Roboto Mono" font-weight="500">
        <tspan x="-9.001" y="0">on</tspan>
      </text>
    </g>
  </g>
`;

const LouvreHTML = `
  <g id="Percent_Box_Element" transform="translate(0 -99)">
    <g
      id="STATE_Percent"
      data-name="STATE Percent"
      transform="translate(0 99)"
    >
      <g
        id="Percent_Box_Box"
        data-name="Rechteck 5"
        fill="#00ff08"
        stroke="#000"
        stroke-width="0.75"
      >
        <rect width="30" height="30" stroke="none"></rect>
          <rect
            x="0.375"
            y="0.375"
            width="29.25"
            height="29.25"
            fill="none"
          >
          </rect>
          </g>
            <text
              id="Percent_text"
              data-name="100%"
              transform="translate(2 9)"
              stroke="rgba(0,0,0,0)"
              stroke-width="1"
              font-size="11"
              font-family="RobotoMono-Medium, Roboto Mono"
              font-weight="500"
              style="fill: black;"
            >
              <tspan x="0" y="10">100%</tspan>
            </text>
          </g>
        </rect>
      </g>
    </g>
  </g>
`;

const TempSollHTML = `
  <g id="Temp_Soll" data-name="Temp" transform="translate(257 1)">
    <text
      id="Soll_28_0_C"
      data-name="Soll 28,0&deg;C"
      transform="translate(0 15)"
      font-size="14"
      font-family="RobotoMono-Bold, Roboto Mono"
      font-weight="700"
      letter-spacing="0.03em"
      style="fill: blue"
    >
          <tspan x="0" y="0">Soll</tspan>
          <tspan x="0" y="19">28,0&deg;C</tspan>
        </text>
      </g>

`;
/////

// document.body.innerHTML += `<svg style="display: none">` + LouvreHTML + `</svg>`;

// const appheader = document.getElementById('Header');
// appheader.innerHTML = `<tspan x="0" y="0">Outdoor</tspan>`;

vis.binds["ctk-widget-extendedcontroller"] = {
	version: "0.0.3",
	showVersion: function () {
		if (vis.binds["ctk-widget-extendedcontroller"].version) {
			console.log("Version ctk-widget-extended: " + vis.binds["ctk-widget-extendedcontroller"].version);
			vis.binds["ctk-widget-extendedcontroller"].version = null;
		}
	},
	createWidget: function (widgetID, view, data, style) {
		var $div = $("#" + widgetID);
		// if nothing found => wait
		if (!$div.length) {
			return setTimeout(function () {
				vis.binds["ctk-widget-extendedcontroller"].createWidget(widgetID, view, data, style);
			}, 100);
		}

		var text = "";
		text += "OID: " + data.oid + "</div><br>";
		text += 'OID value: <span class="ctk-widget-extended-value">' + vis.states[data.oid + ".val"] + "</span><br>";
		text += 'Color: <span style="color: ' + data.myColor + '">' + data.myColor + "</span><br>";
		text += "extraAttr: " + data.extraAttr + "<br>";
		text += "Browser instance: " + vis.instance + "<br>";
		text += 'htmlText: <textarea readonly style="width:100%">' + (data.htmlText || "") + "</textarea><br>";
		text += "htmlText200: <span>s" + (data.htmlText || "") + "</span><br>";

		for (let index = 0; index < roomlist.listSize; index++) {
			var room = roomlist.items[index];
			var roomname = room.name;
			var textinfogroupname = roomname + "_Text_info_group";
			var svg_id_name = roomname + "_elementsvg";
			const app = document.getElementById("app");
			var addelement = maintemplate;
			addelement = addelement.replace("templateelement", svg_id_name);

			app.innerHTML += addelement;
			document.getElementById(svg_id_name).getElementById("Text_info_group").id = textinfogroupname;
			var headerid = "Header_" + roomname;
			var textgruppierung_Header =
				`
			  <text
				id="` +
				headerid +
				`" 
				transform="translate(0 18)"
				fill="#393939"
				font-size="17"
				font-family="SegoeUI-Bold, Segoe UI"
				font-weight="700"
			  >
			  </text>
		  `;
			// app = document.getElementById('app');

			const Text_info_group_Element = document.getElementById(textinfogroupname);
			Text_info_group_Element.innerHTML += textgruppierung_Header;

			const elemHeader = document.getElementById(headerid);
			var headertext = `<tspan x="0" y="0">` + roomname + `</tspan>`;
			elemHeader.innerHTML = headertext;

			//////COUNTINGS//////
			const Light_Element = document.getElementById(svg_id_name).getElementById("Light_label");
			const Louvre_Element = document.getElementById(svg_id_name).getElementById("Louvre_label");

			room.lights = lightlist.items.filter((x) => x.roomid == room.id);
			Light_Element.textContent = room.lights.length + " Lights";

			room.louvres = louvrelist.items.filter((x) => x.roomid == room.id);
			Louvre_Element.textContent = room.louvres.length + " Louvre";

			let lightroomlist = new List();
			lightroomlist.items = room.lights;
			let louvreroomlist = new List();
			louvreroomlist.items = room.louvres;

			console.info(roomlist.items[index]);
			try {
				console.info("Licht________________________Beginn");
				const LightBoxGroup_Element = document
					.getElementById(svg_id_name)
					.getElementById("Light_buttons_group");
				LightBoxGroup_Element.id = room.id + "_Light_buttons_group";
				for (let indexlight = 0; indexlight < lightroomlist.items.length; indexlight++) {
					var currentlight = lightroomlist.items[indexlight];
					var Light_Box_name = currentlight.id + `_Light_On_Off_Box`;
					var Light_Box_Group_name = room.id + "_Light_buttons_group";
					/////LICHTER
					console.info(currentlight);
					var newlightelement = LightHTML;
					let agge = (-89 + 38 * indexlight).toString();
					newlightelement = newlightelement.replace(
						`transform="translate(-89 -21)"`,
						`transform="translate(` + agge + ` -21)"`,
					);
					LightBoxGroup_Element.innerHTML += newlightelement;
					document.getElementById("Light_Box").id = Light_Box_name;
					const Light_Box_Element = document.getElementById(Light_Box_name);
					// Light_Box_Element.attributes.transform.textContent = "transform(" + agge + ",-21)"
					// translate(-89 + 31 * indexlight, -21)
					// LightBoxGroup_Element.getElementById("")

					/////LICHTER ENDE
				}
				console.info("Licht________________________Ende");
			} catch (ex) {
				console.error(ex);
			}

			try {
				console.info("Louvres________________________Beginn");
				const LouvreBoxGroup_Element = document
					.getElementById(svg_id_name)
					.getElementById("Louvres_buttons_group");
				LouvreBoxGroup_Element.id = room.id + "_Louvres_buttons_group";
				for (let indexlouvre = 0; indexlouvre < louvreroomlist.items.length; indexlouvre++) {
					var currentlouvre = louvreroomlist.items[indexlouvre];
					var Louvres_Box_name = currentlouvre.id + `_Louvres_Box`;
					var Louvres_Box_Group_name = room.id + "_Louvres_buttons_group";
					var Current_Percent_Box_ID = currentlouvre.id + "_Louvre_Percent_Box_Element";
					var Current_Percent_Box_Textid =
						room.id + "__" + currentlouvre.id + "_Louvre_Percent_Box_Percent_text_Element";
					/////LICHTER
					console.info(currentlouvre);
					// document.getElementById('Percent_Box_Element')
					var newlouvreelement = document.createElementNS("http://www.w3.org/2000/svg", "g");
					newlouvreelement.innerHTML = LouvreHTML;
					// var newlouvreelement = LouvreHTML;
					let agge = (0 + 38 * indexlouvre).toString();
					// newlouvreelement = newlouvreelement.replace(`transform="translate(0 -99)"`, `transform="translate(` + agge + ` -99)"`);
					LouvreBoxGroup_Element.appendChild(newlouvreelement);
					const added_LouvreElement = document.getElementById("Percent_Box_Element");
					added_LouvreElement.id = Current_Percent_Box_ID;
					added_LouvreElement.transform.baseVal[0].matrix.e = agge;
					const Text_LouvreElement = document.getElementById("Percent_text");
					Text_LouvreElement.id = Current_Percent_Box_Textid;
					Text_LouvreElement.innerHTML = `<tspan x="0" y="10">` + indexlouvre * 50 + `%</tspan>`;

					// document.getElementById("Louvres_Box").id = Louvres_Box_name;
					const Louvres_Box_Element = document.getElementById(Louvres_Box_name);
					// Light_Box_Element.attributes.transform.textContent = "transform(" + agge + ",-21)"
					// translate(-89 + 31 * indexlouvre, -21)
					// LightBoxGroup_Element.getElementById("")

					/////LICHTER ENDE
				}
				console.info("Louvres________________________Ende");
			} catch (ex) {
				console.error(ex);
			}
		}

		$("#" + widgetID).html(text);

		// subscribe on updates of value
		function onChange(e, newVal, oldVal) {
			$div.find(".template-value").html(newVal);
		}
		if (data.oid) {
			vis.states.bind(data.oid + ".val", onChange);
			//remember bound state that vis can release if didnt needed
			$div.data("bound", [data.oid + ".val"]);
			//remember onchange handler to release bound states
			$div.data("bindHandler", onChange);
		}
	},
};

vis.binds["ctk-widget-extendedcontroller"].showVersion();
