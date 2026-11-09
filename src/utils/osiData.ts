export interface SceneCue {
  timeOffset: string; // e.g. "00:25"
  label: string;
}

export interface CartesiaVoiceConfig {
  id: string;
  name: string;
  gender: 'male' | 'female';
  language: string;
  recommendedRole: string;
  description: string;
}

export interface CartesiaPrompt {
  voiceId: string;
  voiceName: string;
  model: string; // 'sonic-multilingual' | 'sonic-german'
  language: string; // 'de'
  speed: number;
  emotion: string;
  cleanScript: string;
  pronunciationNotes?: string[];
  samplePayloadJson: string;
  sampleCurlCommand: string;
}

export interface PresentationScene {
  id: string;
  sceneNumber: number;
  title: string;
  speaker: string;
  speakerRole: string;
  speakerColor: string;
  timeStart: string; // "00:00"
  timeEnd: string; // "00:18"
  startSeconds: number;
  endSeconds: number;
  durationSeconds: number;
  layers: number[]; // e.g. [7] or [6, 5]
  slides: string;
  topic: string;
  scriptText: string;
  transitionCue?: string;
  cues: SceneCue[];
  directorNotes: string;
  aiVideoPrompt: string;
  cartesiaPrompt?: CartesiaPrompt;
  youtubeSourceUrl?: string;
  youtubeVideoId?: string;
}

export interface OSILayer {
  number: number;
  nameDe: string;
  nameEn: string;
  pdu: string;
  color: string;
  accent: string;
  devices: string[];
  protocols: string[];
  description: string;
  troubleshootingCheck: string;
  tcpIpLayer: string;
}

export interface EncapsulationStep {
  step: number;
  layerNumber: number;
  layerName: string;
  addedHeader: string;
  pduName: string;
  explanation: string;
  payloadVisual: string[];
}

export const TECHNICAL_SPEC_720P = {
  resolution: "1280 × 720 px",
  aspectRatio: "16:9",
  fps: 30,
  codec: "H.264 / AVC",
  container: "MP4",
  audio: "AAC, 48 kHz, Stereo",
  targetLoudness: "-16 LUFS",
  videoBitrate: "5–8 Mbit/s",
  recommendedFilename: "OSI_Modell_Comcave_720p_12min.mp4",
  maxDuration: "12:00 Minuten (720 Sekunden)",
};

export const OSI_LAYERS: OSILayer[] = [
  {
    number: 7,
    nameDe: "Anwendungsschicht",
    nameEn: "Application Layer",
    pdu: "Daten (Data)",
    color: "#EF4444", // Red/Coral
    accent: "bg-red-500/20 text-red-400 border-red-500/40",
    devices: ["Host", "PC", "Server", "Browser", "Mail-Client"],
    protocols: ["HTTP", "HTTPS", "SMTP", "DNS", "FTP", "SSH", "DHCP"],
    description: "Schnittstelle zum Benutzer und den Anwendungsprogrammen. Programme übergeben ihre Daten ohne Wissen über die physikalische Übertragung.",
    troubleshootingCheck: "Dienste prüfen: Läuft der Webserver/Mailserver? DNS-Auflösung korrekt? Konfiguration der Software intakt?",
    tcpIpLayer: "Anwendungsschicht (Application)"
  },
  {
    number: 6,
    nameDe: "Darstellungsschicht",
    nameEn: "Presentation Layer",
    pdu: "Daten (Data)",
    color: "#F97316", // Orange
    accent: "bg-orange-500/20 text-orange-400 border-orange-500/40",
    devices: ["Betriebssystem-Komponenten", "Kryptographie-Module"],
    protocols: ["TLS / SSL", "ASCII", "Unicode", "JPEG", "PNG", "MIME", "GZIP"],
    description: "Formatiert Daten in systemunabhängige Formate. Zuständig für Verschlüsselung (TLS), Dekomprimierung und Zeichenkodierung.",
    troubleshootingCheck: "Zertifikate & Verschlüsselung prüfen: Ist das SSL/TLS-Zertifikat gültig? Stimmt die Zeichenkodierung (UTF-8)?",
    tcpIpLayer: "Anwendungsschicht (Application)"
  },
  {
    number: 5,
    nameDe: "Sitzungsschicht",
    nameEn: "Session Layer",
    pdu: "Daten (Data)",
    color: "#FBBF24", // Amber/Yellow
    accent: "bg-amber-500/20 text-amber-400 border-amber-500/40",
    devices: ["Betriebssystem-API", "Sockets"],
    protocols: ["RPC", "NetBIOS", "PPTP", "SIP", "SMB (Session)"],
    description: "Moderator der Verbindung: Baut logische Kommunikationssitzungen zwischen zwei Systemen auf, hält sie aktiv und beendet sie sauber.",
    troubleshootingCheck: "Sitzungsabbrüche analysieren: Werden Sessions vorzeitig getrennt? Timeouts bei Keep-Alive Verbindungen?",
    tcpIpLayer: "Anwendungsschicht (Application)"
  },
  {
    number: 4,
    nameDe: "Transportschicht",
    nameEn: "Transport Layer",
    pdu: "Segmente (TCP) / Datagramme (UDP)",
    color: "#10B981", // Emerald/Green
    accent: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
    devices: ["Stateful Firewalls", "Load Balancer (L4)"],
    protocols: ["TCP", "UDP", "SCTP", "QUIC"],
    description: "Zerlegt Daten in Segmente, vergibt Portnummern und steuert Flusskontrolle sowie Fehlerkorrektur (TCP Handshake, ACKs).",
    troubleshootingCheck: "Ports prüfen: Ist der Zielport offen (80, 443)? Blockiert die lokale Firewall? Funktioniert der TCP-Handshake?",
    tcpIpLayer: "Transportschicht (Transport)"
  },
  {
    number: 3,
    nameDe: "Vermittlungsschicht",
    nameEn: "Network Layer",
    pdu: "Pakete (Packets)",
    color: "#06B6D4", // Cyan
    accent: "bg-cyan-500/20 text-cyan-400 border-cyan-500/40",
    devices: ["Router", "Layer-3-Switch"],
    protocols: ["IPv4", "IPv6", "ICMP (Ping)", "IPsec", "OSPF", "BGP"],
    description: "Globale Adressierung mittels IP-Adressen und Wegewahl (Routing) zwischen unterschiedlichen Netzwerken.",
    troubleshootingCheck: "IP-Konfiguration & Routing: Hat das Gerät eine gültige IP/Subnetzmaske? Standard-Gateway erreichbar? Ping / Traceroute?",
    tcpIpLayer: "Internetschicht (Internet)"
  },
  {
    number: 2,
    nameDe: "Sicherungsschicht",
    nameEn: "Data Link Layer",
    pdu: "Frames (Rahmen)",
    color: "#3B82F6", // Blue
    accent: "bg-blue-500/20 text-blue-400 border-blue-500/40",
    devices: ["Switch (Layer 2)", "Bridge", "WLAN Access Point"],
    protocols: ["Ethernet (IEEE 802.3)", "WLAN (802.11)", "ARP", "VLAN (802.1Q)"],
    description: "Lokale Zustellung über physische MAC-Adressen im LAN. Verpackt Pakete in Frames mit Prüfsumme (CRC / FCS) zur Fehlererkennung.",
    troubleshootingCheck: "Lokale Verbindung prüfen: Leuchtet Link-LED am Switch? Stimmen MAC-Adressen? ARP-Tabelle gefüllt? Frame-Fehler (CRC)?",
    tcpIpLayer: "Netzzugangsschicht (Network Access)"
  },
  {
    number: 1,
    nameDe: "Bitübertragungsschicht",
    nameEn: "Physical Layer",
    pdu: "Bits (0 & 1 Signale)",
    color: "#8B5CF6", // Violet
    accent: "bg-purple-500/20 text-purple-400 border-purple-500/40",
    devices: ["Kupferkabel (Cat6/7)", "Glasfaser (LWL)", "WLAN-Antenne", "Repeater", "Hub"],
    protocols: ["1000BASE-T", "10GBASE-LR", "DSL", "Funkfrequenzen (2.4/5 GHz)"],
    description: "Überträgt die rohen Bits als elektrische Spannung, Lichtimpulse oder Funkwellen über das physikalische Medium.",
    troubleshootingCheck: "Physikalische Schicht: Ist das Kabel eingesteckt oder geknickt? Patchpanel geprüft? Gibt es Funkstörungen? Port aktiv?",
    tcpIpLayer: "Netzzugangsschicht (Network Access)"
  }
];

export const PRESENTATION_SCENES: PresentationScene[] = [
  {
    id: "scene-0",
    sceneNumber: 0,
    title: "Szene 0: Intro – Titelfolie & Team",
    speaker: "Intro",
    speakerRole: "Eröffnung & Übersicht",
    speakerColor: "from-slate-700 to-slate-900 border-slate-600",
    timeStart: "00:00",
    timeEnd: "00:18",
    startSeconds: 0,
    endSeconds: 18,
    durationSeconds: 18,
    layers: [],
    slides: "Folie 1: Titelfolie",
    topic: "Titelfolie, Team Comcave, OSI-Modell Schichtenmodell der Netzwerkkommunikation",
    scriptText: "[Kein Sprechtext – Ruhige Technik-Hintergrundmusik, sanfter Fade-In über 1 Sekunde]\n\nEinblendung Titelfolie:\nOSI-Modell – Schichtenmodell der Netzwerkkommunikation\nFISI Umschulung – Comcave\nPräsentation: Patrick, Bastian, Issa, Thomas, Adem",
    directorNotes: "Kein Sprechen. Nur ruhige Musik oder Stille. Die Folie soll ruhig und professionell wirken. Nach 18 Sekunden direkter harter Schnitt zu Patrick.",
    cues: [
      { timeOffset: "00:00", label: "Schwarzer Fade-in über 1 Sekunde" },
      { timeOffset: "00:05", label: "Titelfolie erscheint zentral" },
      { timeOffset: "00:10", label: "Team-Layout einblenden (Patrick, Bastian, Issa, Thomas, Adem)" },
      { timeOffset: "00:18", label: "Harter Schnitt auf Patrick" }
    ],
    aiVideoPrompt: "Create a professional German IT training video intro in 720p, 16:9, 30 fps. Dark blue and anthrazit background with glowing geometric network lines and cyber particles. Central clean slide appears with bold white text: 'OSI-Modell – Schichtenmodell der Netzwerkkommunikation' and underneath 'FISI Umschulung – Comcave'. Team names appear: Patrick, Bastian, Issa, Thomas, Adem. Calm corporate IT aesthetic, high quality 720p educational presentation."
  },
  {
    id: "scene-1",
    sceneNumber: 1,
    title: "Szene 1: Patrick – Begrüßung & Anwendungsschicht",
    speaker: "Patrick",
    speakerRole: "Einleitung & Layer 7",
    speakerColor: "from-red-900/60 to-red-950/80 border-red-500",
    timeStart: "00:18",
    timeEnd: "02:18",
    startSeconds: 18,
    endSeconds: 138,
    durationSeconds: 120,
    layers: [7],
    slides: "Folie 1–3 und Folie 8",
    topic: "Einführung, ISO 1984, Schicht 7 (Application Layer)",
    scriptText: "Guten Morgen zusammen.\n\nWir präsentieren euch heute das OSI-Modell.\n\nDas OSI-Modell wurde 1984 von der ISO entwickelt.\n\nDer Zweck war ganz klar: Computersysteme unterschiedlicher Hersteller sollten weltweit miteinander kommunizieren können – unabhängig davon, welche Hardware oder welches Betriebssystem eingesetzt wird.\n\nDas Modell besteht aus sieben Schichten.\n\nDiese sieben Schichten helfen uns dabei, Netzwerkkommunikation sauber zu strukturieren.\n\nIch starte direkt ganz oben, beim Benutzer, mit Schicht 7: der Anwendungsschicht, dem Application Layer.\n\nHier befinden sich die Protokolle, die unsere Programme nutzen.\n\nWenn ihr zum Beispiel eine Website öffnet, nutzt der Browser HTTP oder HTTPS.\n\nBei E-Mails kommt SMTP zum Einsatz.\n\nSchicht 7 ist also unser Tor zum Netzwerk.\n\nSie ist die Schicht, mit der Anwendungen wie Browser, E-Mail-Programme oder Dateiübertragungsprogramme direkt arbeiten.\n\nWichtig ist dabei: Die Anwendung selbst muss nicht wissen, wie die Daten physikalisch übertragen werden. Sie übergibt ihre Daten einfach an die nächste Schicht.\n\nUnd was passiert, nachdem wir die Daten abgeschickt haben?\n\nDas erklärt euch nun Bastian.",
    transitionCue: "Das erklärt euch nun Bastian.",
    directorNotes: "Patrick steht vor der Klasse oder neutraler Wand. Blick direkt in die Kamera. Bei erwähnten Begriffen Folien/Grafiken einblenden. Klare Übergabe ohne Pause direkt zum Schnitt.",
    cues: [
      { timeOffset: "00:25", label: "„OSI-Modell“ groß auf Folie" },
      { timeOffset: "00:35", label: "„1984 – ISO“ Infografik" },
      { timeOffset: "00:45", label: "7-Schichten-Diagramm erscheint von oben nach unten" },
      { timeOffset: "01:00", label: "Layer 7 wird orange/rot hervorgehoben" },
      { timeOffset: "01:15", label: "Icons: Browser, E-Mail, HTTP, HTTPS, SMTP" },
      { timeOffset: "01:45", label: "Text: „Application Layer = Tor zum Netzwerk“" },
      { timeOffset: "02:10", label: "Übergangsgrafik: Pfeil nach unten zu Layer 6" }
    ],
    aiVideoPrompt: "German IT presenter Patrick introduces the OSI model in a modern training seminar room. Slide shows 'OSI Model, 7 layers, ISO 1984'. Highlight Layer 7 Application Layer with clean animated icons for Web browser, Email, HTTP, HTTPS, SMTP. Lower third displaying 'Patrick - Einleitung & Layer 7'. Professional, calm, 720p, 16:9, educational style."
  },
  {
    id: "scene-2",
    sceneNumber: 2,
    title: "Szene 2: Bastian – Darstellungsschicht & Sitzungsschicht",
    speaker: "Bastian",
    speakerRole: "Layer 6 & Layer 5",
    speakerColor: "from-orange-900/60 to-orange-950/80 border-orange-500",
    timeStart: "02:18",
    timeEnd: "04:18",
    startSeconds: 138,
    endSeconds: 258,
    durationSeconds: 120,
    layers: [6, 5],
    slides: "Folie 7: Layer 6 & 5",
    topic: "Formatierung, TLS-Verschlüsselung, Kompression, Sitzungsverwaltung",
    scriptText: "Danke, Patrick.\n\nBevor Daten wirklich ins Netz gehen, müssen sie erst einmal aufbereitet werden.\n\nDas macht Schicht 6: die Darstellungsschicht, also der Presentation Layer.\n\nHier werden Daten formatiert.\n\nZum Beispiel werden Bilder in JPEG kodiert, Texte in ASCII oder Unicode dargestellt, und Dateien werden in ein einheitliches Format gebracht, damit verschiedene Systeme sie verstehen können.\n\nSehr wichtig in dieser Schicht ist außerdem die Verschlüsselung.\n\nWenn ihr sicher im Internet surft, kommt hier zum Beispiel TLS ins Spiel.\n\nTLS sorgt dafür, dass Daten verschlüsselt übertragen werden und nicht ohne Weiteres mitgelesen werden können.\n\nZusätzlich kann in Schicht 6 auch Datenkompression stattfinden.\n\nDas bedeutet: Große Datenmengen werden kleiner gemacht, damit sie effizienter übertragen werden können.\n\nDanach folgt Schicht 5: die Sitzungsschicht, der Session Layer.\n\nStellt euch diese Schicht wie einen Moderator vor.\n\nSie baut die Kommunikationssitzung zwischen zwei Systemen auf.\n\nSie hält die Verbindung aktiv.\n\nUnd sie beendet die Sitzung am Ende auch wieder sauber.\n\nWenn zum Beispiel eine Verbindung kurz abreißt, kann Schicht 5 dabei helfen, die Kommunikation wieder aufzunehmen, ohne den gesamten Vorgang neu starten zu müssen.\n\nKurz gesagt: Schicht 6 bereitet die Daten auf, und Schicht 5 verwaltet den Gesprächsverlauf zwischen den Systemen.\n\nWie die Daten nun transportiert werden, zeigt euch Issa.",
    transitionCue: "Wie die Daten nun transportiert werden, zeigt euch Issa.",
    directorNotes: "Bastian spricht ruhig und sachlich. Bei „TLS“ kurz Schloss-Icon einblenden. Bei „Sitzung“ einfache Grafik zweier verbundener Systeme. Übergabe an Issa klar betonen.",
    cues: [
      { timeOffset: "02:25", label: "Layer 6 hervorgehoben" },
      { timeOffset: "02:40", label: "Beispiele: JPEG, ASCII, Unicode" },
      { timeOffset: "03:00", label: "Schloss-Symbol für TLS / Verschlüsselung" },
      { timeOffset: "03:15", label: "Kompressionsgrafik: große Datei wird komprimiert" },
      { timeOffset: "03:30", label: "Layer 5 hervorgehoben" },
      { timeOffset: "03:45", label: "Grafik: zwei Computer bauen Verbindung auf" },
      { timeOffset: "04:00", label: "Text: „Sitzung aufbauen – halten – beenden“" },
      { timeOffset: "04:12", label: "Pfeil nach unten zu Layer 4" }
    ],
    aiVideoPrompt: "German IT presenter Bastian explains Layer 6 Presentation Layer and Layer 5 Session Layer. Show data formatting, JPEG, ASCII, TLS encryption lock icon, data compression graphic, and session handshake establishment between two computers. Clean slide animation, lower third 'Bastian - Layer 6 & Layer 5', professional educational video, 720p 16:9."
  },
  {
    id: "scene-3",
    sceneNumber: 3,
    title: "Szene 3: Issa – Transportschicht & Vermittlungsschicht",
    speaker: "Issa",
    speakerRole: "Layer 4 & Layer 3",
    speakerColor: "from-emerald-900/60 to-emerald-950/80 border-emerald-500",
    timeStart: "04:18",
    timeEnd: "06:18",
    startSeconds: 258,
    endSeconds: 378,
    durationSeconds: 120,
    layers: [4, 3],
    slides: "Folie 6 & 5",
    topic: "Segmente, TCP vs. UDP, Ports, IP-Pakete, Router & Routing",
    scriptText: "Genau.\n\nJetzt müssen die Daten reisefertig gemacht werden.\n\nDas passiert in Schicht 4: der Transportschicht, also dem Transport Layer.\n\nHier werden die Daten in Segmente zerlegt.\n\nMan kann sich das so vorstellen: Eine große Nachricht wird in mehrere kleinere Teile aufgeteilt, damit sie besser übertragen und später wieder zusammengesetzt werden kann.\n\nIn dieser Schicht haben wir vor allem zwei wichtige Protokolle: TCP und UDP.\n\nTCP steht für eine sichere Übertragung.\n\nDabei gibt es Empfangsbestätigungen. Wenn ein Segment verloren geht, wird es erneut übertragen.\n\nDas ist zum Beispiel wichtig bei Downloads, E-Mails oder Webseiten, bei denen Daten vollständig ankommen müssen.\n\nUDP dagegen ist schneller, aber unzuverlässiger.\n\nHier werden Verluste nicht unbedingt korrigiert.\n\nDas ist sinnvoll bei Videostreams, Online-Spielen oder Voice-over-IP, wo Geschwindigkeit wichtiger ist als perfekte Vollständigkeit.\n\nAußerdem werden in Schicht 4 die Ports vergeben.\n\nPorts sagen dem Zielsystem, an welche Anwendung oder welchen Dienst die Daten übergeben werden sollen.\n\nDann geht es weiter in Schicht 3: die Vermittlungsschicht, also den Network Layer.\n\nHier kommen die IP-Adressen ins Spiel.\n\nAus den Segmenten werden Pakete.\n\nJedes Paket enthält eine Quell-IP-Adresse und eine Ziel-IP-Adresse.\n\nDer Router schaut sich die Ziel-IP an und sucht den besten Weg durch das Netzwerk.\n\nDiesen Vorgang nennt man Routing.\n\nVereinfacht gesagt: Schicht 4 regelt den Transport, und Schicht 3 regelt den Weg.\n\nThomas erklärt euch jetzt, wie das im lokalen Netz aussieht.",
    transitionCue: "Thomas erklärt euch jetzt, wie das im lokalen Netz aussieht.",
    directorNotes: "TCP/UDP-Vergleich gern zweispaltig visualisieren (Zuverlässig vs. Schnell). Ports kurz anreißen (80, 443, 53). Routing-Pfad als animierte Linie von Router zu Router.",
    cues: [
      { timeOffset: "04:25", label: "Layer 4 hervorgehoben" },
      { timeOffset: "04:40", label: "Animation: Daten werden in Segmente geteilt" },
      { timeOffset: "05:00", label: "TCP vs. UDP Vergleichstabelle" },
      { timeOffset: "05:15", label: "Port-Beispiele: 80, 443, 53, 25" },
      { timeOffset: "05:30", label: "Layer 3 hervorgehoben" },
      { timeOffset: "05:45", label: "IP-Paket mit Quell- und Zieladresse" },
      { timeOffset: "06:00", label: "Router sucht Pfad im Netzwerk (Routing)" },
      { timeOffset: "06:12", label: "Übergabe an Thomas" }
    ],
    aiVideoPrompt: "German IT presenter Issa explains Layer 4 Transport Layer and Layer 3 Network Layer. Show data segmentation into segments, TCP reliable transfer with handshake vs UDP fast stream, ports 80/443, IP packets with source and destination IP, and a glowing router network path. Modern network diagram, lower third 'Issa - Layer 4 & Layer 3', 720p 16:9."
  },
  {
    id: "scene-4",
    sceneNumber: 4,
    title: "Szene 4: Thomas – Sicherungsschicht & Bitübertragungsschicht",
    speaker: "Thomas",
    speakerRole: "Layer 2 & Layer 1",
    speakerColor: "from-blue-900/60 to-blue-950/80 border-blue-500",
    timeStart: "06:18",
    timeEnd: "08:18",
    startSeconds: 378,
    endSeconds: 498,
    durationSeconds: 120,
    layers: [2, 1],
    slides: "Folie 4: Layer 2 & 1",
    topic: "Switches, MAC-Adressen, Ethernet-Frames, Bits 0/1, Kupfer, Glasfaser, WLAN",
    scriptText: "Danke, Issa.\n\nWenn das IP-Paket bei uns im Hausnetz ankommt, übernimmt Schicht 2: die Sicherungsschicht, also der Data Link Layer.\n\nHier arbeiten Switches.\n\nDie Pakete werden in Frames verpackt.\n\nEin Frame enthält unter anderem die MAC-Adressen.\n\nDie MAC-Adresse ist eine eindeutige Adresse der Netzwerkkarte.\n\nÜber diese MAC-Adresse weiß der Switch, an welchen konkreten Rechner oder welches Gerät im lokalen Netz das Datenpaket weitergeleitet werden muss.\n\nMan kann sagen: Schicht 3 kümmert sich um den logischen Weg über IP-Adressen, und Schicht 2 kümmert sich um die lokale Zustellung über MAC-Adressen.\n\nGanz unten sind wir dann bei Schicht 1 angekommen: der Bitübertragungsschicht, dem Physical Layer.\n\nHier gibt es keine Pakete oder Frames mehr.\n\nHier gibt es nur noch Nullen und Einsen.\n\nDas sind rohe Signale.\n\nDiese Signale können elektrische Spannungen über Kupferkabel sein, Lichtimpulse über Glasfaserkabel oder Funkwellen im WLAN.\n\nSchicht 1 ist also die Grundlage von allem: Ohne physikalische Übertragung gibt es kein Netzwerk.\n\nKurz zusammengefasst: Layer 2 sorgt für die lokale Übertragung zwischen Geräten, und Layer 1 überträgt die Bits tatsächlich über das Medium.\n\nAdem fasst das nun für uns in der Praxis zusammen.",
    transitionCue: "Adem fasst das nun für uns in der Praxis zusammen.",
    directorNotes: "Thomas sollte nicht hetzen. MAC-Adresse klar von IP abgrenzen: Hardwarenah, lokal, Switch. Echte Fotos/Icons von Kupferkabeln, Glasfaser und WLAN zeigen.",
    cues: [
      { timeOffset: "06:25", label: "Layer 2 hervorgehoben" },
      { timeOffset: "06:40", label: "Switch im Server-Rack" },
      { timeOffset: "06:55", label: "Frame mit MAC-Source und MAC-Destination" },
      { timeOffset: "07:15", label: "Layer 1 hervorgehoben" },
      { timeOffset: "07:30", label: "Kupferkabel, Glasfaser, WLAN einblenden" },
      { timeOffset: "07:50", label: "Animation: 0 und 1 als Signalimpulse" },
      { timeOffset: "08:05", label: "Text: „Ohne Layer 1 kein Netzwerk“" },
      { timeOffset: "08:12", label: "Übergabe an Bastian / Adem" }
    ],
    aiVideoPrompt: "German IT presenter Thomas explains Layer 2 Data Link Layer and Layer 1 Physical Layer. Show rack switch, MAC addresses, Ethernet frames, copper Cat6 cables, fiber optic glowing light pulses, Wi-Fi radio waves, and binary bits 0 and 1 stream. Professional technical visualization, lower third 'Thomas - Layer 2 & Layer 1', 720p 16:9."
  },
  {
    id: "scene-5",
    sceneNumber: 5,
    title: "Szene 5: Bastian – Exkurs TCP/IP vs. OSI",
    speaker: "Bastian",
    speakerRole: "TCP/IP-Exkurs",
    speakerColor: "from-amber-900/60 to-amber-950/80 border-amber-500",
    timeStart: "08:18",
    timeEnd: "09:18",
    startSeconds: 498,
    endSeconds: 558,
    durationSeconds: 60,
    layers: [7, 6, 5, 4, 3, 2, 1],
    slides: "Folie 9: OSI vs. TCP/IP",
    topic: "Theorie vs. Praxis: 7 Schichten OSI vs. 4 Schichten TCP/IP",
    scriptText: "Bevor wir zum Fazit kommen, noch ein kurzer Vergleich.\n\nIn der echten Welt nutzen wir meistens das TCP/IP-Modell.\n\nEs ist schlanker und hat nur vier Schichten statt sieben.\n\nDie oberen drei OSI-Schichten – also Anwendungsschicht, Darstellungsschicht und Sitzungsschicht – werden bei TCP/IP einfach als Anwendungsschicht zusammengefasst.\n\nDarunter folgen Transportschicht, Internetschicht und Netzzugangsschicht.\n\nWichtig für uns ist:\n\nOSI ist unser theoretisches Referenzmodell.\n\nTCP/IP ist das Modell, das praktisch im Internet läuft.\n\nBeide Modelle helfen uns aber dabei, Netzwerkprobleme einzuordnen und zu verstehen.\n\nAdem übernimmt jetzt das Praxisbeispiel und das Fazit.",
    transitionCue: "Adem übernimmt jetzt das Praxisbeispiel und das Fazit.",
    directorNotes: "Kompakt, ruhig und präzise. Visueller 1-zu-1 Vergleich zwischen den 7 OSI-Schichten und 4 TCP/IP-Schichten ist essenziell.",
    cues: [
      { timeOffset: "08:20", label: "Folie „OSI vs. TCP/IP“" },
      { timeOffset: "08:30", label: "OSI 7 Schichten links aufgebaut" },
      { timeOffset: "08:40", label: "TCP/IP 4 Schichten rechts aufgebaut" },
      { timeOffset: "08:50", label: "Verbindungslinien: Layer 7/6/5 → Application" },
      { timeOffset: "09:00", label: "Text: „OSI = Referenzmodell, TCP/IP = Praxis“" },
      { timeOffset: "09:15", label: "Schnitt zu Adem" }
    ],
    aiVideoPrompt: "Short comparison infographic slide: OSI 7 layers on the left side versus TCP/IP 4 layers on the right side. Animated connector lines showing OSI layers 7, 6, 5 merging into TCP/IP Application layer. Highlighting 'OSI = Referenzmodell, TCP/IP = Praxis im Internet'. Clean modern tech infographic, 720p 16:9, educational style."
  },
  {
    id: "scene-6",
    sceneNumber: 6,
    title: "Szene 6: Adem – Praxisbeispiel, Kapselung & Fazit",
    speaker: "Adem",
    speakerRole: "Praxis & Fazit",
    speakerColor: "from-cyan-900/60 to-cyan-950/80 border-cyan-500",
    timeStart: "09:18",
    timeEnd: "11:48",
    startSeconds: 558,
    endSeconds: 708,
    durationSeconds: 150,
    layers: [7, 6, 5, 4, 3, 2, 1],
    slides: "Folie 10–12",
    topic: "Kapselung beim Webseitenaufruf, Entkapselung, IHK-Troubleshooting von Schicht 1 aufwärts",
    scriptText: "Fassen wir zusammen, wie das Prinzip der Kapselung bei einem Webseitenaufruf aussieht.\n\nAm Anfang steht eine Anwendung.\n\nIhr gebt zum Beispiel eine URL in den Browser ein.\n\nDaraus entsteht ein HTTP-Request.\n\nDieser HTTP-Request befindet sich auf Schicht 7, der Anwendungsschicht.\n\nDann geht die Nachricht eine Ebene tiefer.\n\nAuf Schicht 4, der Transportschicht, wird ein TCP-Header hinzugefügt.\n\nDadurch entsteht ein Segment.\n\nDieses Segment wird weiter nach unten gereicht.\n\nAuf Schicht 3, der Vermittlungsschicht, kommt ein IP-Header dazu.\n\nJetzt sprechen wir von einem Paket.\n\nAnschließend geht es auf Schicht 2, die Sicherungsschicht.\n\nDort wird ein MAC-Header ergänzt, und oft auch ein Trailer zur Fehlererkennung.\n\nDaraus wird ein Frame.\n\nGanz unten, auf Schicht 1, wird dieser Frame schließlich in Bits umgewandelt und als elektrisches Signal, Lichtsignal oder Funksignal übertragen.\n\nWichtig ist dabei: Jede Schicht kennt nur ihre eigene Aufgabe.\n\nDie untere Schicht muss nicht wissen, ob oben ein Browser, eine E-Mail oder ein Datei-Download läuft.\n\nSie hängt einfach ihr eigenes Etikett an die Daten an.\n\nBeim Empfänger läuft das Ganze dann umgekehrt ab.\n\nVon unten nach oben wird ausgepackt.\n\nErst verschwindet der Frame-Header, dann der IP-Header, dann der TCP-Header, und am Ende liegt wieder die ursprüngliche HTTP-Nachricht bei der Anwendung an.\n\nWarum lernen wir FISIs das?\n\nWeil das OSI-Modell unser wichtigstes Werkzeug beim Troubleshooting ist.\n\nWenn das Internet nicht funktioniert, suchen wir nicht wahllos.\n\nWir gehen strukturiert vor.\n\nAuf Schicht 1 prüfen wir: Ist das Kabel eingesteckt? Leuchtet der Port? Gibt es ein physikalisches Signal?\n\nAuf Schicht 2 prüfen wir: Erreicht das Gerät den Switch? Stimmen MAC-Adressen? Gibt es Frame-Fehler?\n\nAuf Schicht 3 prüfen wir: Hat das Gerät eine gültige IP-Adresse? Stimmt das Gateway? Funktioniert das Routing?\n\nAuf Schicht 4 prüfen wir: Ist der richtige Port offen? Funktioniert TCP oder UDP? Wird die Verbindung aufgebaut?\n\nUnd ab Schicht 5 bis 7 schauen wir uns Dienste, Sitzungen, Verschlüsselung und Anwendungen an.\n\nWer das OSI-Modell kennt, stochert bei der Fehlersuche nicht im Dunkeln.\n\nMan kann Probleme eingrenzen, systematisch testen und gezielter lösen.\n\nGenau deshalb ist dieses Modell für uns in der Fachinformatik so wichtig.\n\nVielen Dank für eure Aufmerksamkeit.",
    transitionCue: "Vielen Dank für eure Aufmerksamkeit.",
    directorNotes: "Inhaltlicher Höhepunkt für das IHK-Fachgespräch. Kapselung Schritt für Schritt animieren. Troubleshooting-Leitfaden von Layer 1 aufwärts klar strukturieren. Zum Ende hin ruhigeres Tempo.",
    cues: [
      { timeOffset: "09:20", label: "Titel: „Praxisbeispiel: Webseitenaufruf“" },
      { timeOffset: "09:35", label: "Browser URL Eingabe" },
      { timeOffset: "09:50", label: "HTTP-Request auf Layer 7" },
      { timeOffset: "10:05", label: "TCP-Header wird hinzugefügt (Segment)" },
      { timeOffset: "10:20", label: "IP-Header wird hinzugefügt (Paket)" },
      { timeOffset: "10:35", label: "MAC-Header & Trailer (Frame)" },
      { timeOffset: "10:50", label: "Bits auf Layer 1" },
      { timeOffset: "11:00", label: "Animation: Kapselung (oben → unten)" },
      { timeOffset: "11:10", label: "Animation: Entkapselung (unten → oben)" },
      { timeOffset: "11:20", label: "Troubleshooting-Liste Layer 1–7 einblenden" },
      { timeOffset: "11:35", label: "Text: „Strukturierte Fehlersuche statt Raten“" },
      { timeOffset: "11:45", label: "Danksagung durch Adem" }
    ],
    aiVideoPrompt: "German IT presenter Adem explains network encapsulation in practice. 3D animated diagram of an HTTP payload getting wrapped in TCP header, then IP header, then Ethernet MAC header, and converted into binary pulses. Then show systematic troubleshooting checklist going from Layer 1 to Layer 7. Calm, confident, lower third 'Adem - Praxis & Fazit', professional 720p 16:9."
  },
  {
    id: "scene-7",
    sceneNumber: 7,
    title: "Szene 7: Outro – Dankesfolie & Endcard",
    speaker: "Outro",
    speakerRole: "Abschluss",
    speakerColor: "from-slate-700 to-slate-900 border-slate-600",
    timeStart: "11:48",
    timeEnd: "12:00",
    startSeconds: 708,
    endSeconds: 720,
    durationSeconds: 12,
    layers: [],
    slides: "Folie 12: Endcard / Fazit",
    topic: "Danksagung, Teammitglieder (Patrick, Bastian, Issa, Thomas, Adem), Fade-Out",
    scriptText: "[Kein Sprechtext – Sanfte Outro-Musik]\n\nEinblendung Endcard:\nVielen Dank für eure Aufmerksamkeit!\nOSI-Modell – 7 Schichten\nFISI Umschulung – Comcave\nTeam: Patrick, Bastian, Issa, Thomas, Adem",
    directorNotes: "Kein weiterer Sprecher. 12 Sekunden Endcard. Musik blendet leise auf. Fade-out über die letzten 2 Sekunden ins Schwarze.",
    cues: [
      { timeOffset: "11:48", label: "Endcard blendet ein" },
      { timeOffset: "11:52", label: "Teamnamen erscheinen" },
      { timeOffset: "11:58", label: "Fade-out ins Schwarze (1-2s)" },
      { timeOffset: "12:00", label: "Ende des Videos (Punktlandung 12:00 Min)" }
    ],
    aiVideoPrompt: "Clean, elegant outro endcard for a German IT training presentation. Dark blue and dark slate background with miniature glowing 7-layer OSI model symbol in corner. Golden white text: 'Vielen Dank für Ihre Aufmerksamkeit! - FISI Umschulung Comcave' and listing 'Patrick, Bastian, Issa, Thomas, Adem'. Gentle fade out, 720p 16:9, broadcast standard."
  }
];

export const ENCAPSULATION_STEPS: EncapsulationStep[] = [
  {
    step: 1,
    layerNumber: 7,
    layerName: "Schicht 7: Anwendungsschicht",
    pduName: "Daten (HTTP Payload)",
    addedHeader: "GET /index.html HTTP/1.1",
    explanation: "Der Browser erstellt die eigentliche Nutzlast (User Data). Es gibt noch keine Netzwerk-Header.",
    payloadVisual: ["HTTP Request Data"]
  },
  {
    step: 2,
    layerNumber: 4,
    layerName: "Schicht 4: Transportschicht",
    pduName: "TCP-Segment",
    addedHeader: "TCP-Header (Src Port: 54321, Dst Port: 443/80, Seq, ACK)",
    explanation: "Die Daten werden segmentiert. Der TCP-Header mit Quell- und Zielport wird vorangestellt.",
    payloadVisual: ["[TCP-Header: Port 443]", "HTTP Request Data"]
  },
  {
    step: 3,
    layerNumber: 3,
    layerName: "Schicht 3: Vermittlungsschicht",
    pduName: "IP-Paket",
    addedHeader: "IP-Header (Src IP: 192.168.1.100, Dst IP: 93.184.216.34, TTL)",
    explanation: "Der IP-Header wird ergänzt. Nun enthält die Nachricht Quell- und Ziel-IP für das Routing.",
    payloadVisual: ["[IP-Header: 93.184.216.34]", "[TCP-Header: Port 443]", "HTTP Request Data"]
  },
  {
    step: 4,
    layerNumber: 2,
    layerName: "Schicht 2: Sicherungsschicht",
    pduName: "Ethernet-Frame",
    addedHeader: "MAC-Header (Src MAC, Dst Switch/Router MAC) + FCS Trailer (CRC)",
    explanation: "Der Frame wird mit Quell- und Ziel-MAC verpackt und erhält eine CRC-Prüfsumme am Ende.",
    payloadVisual: ["[MAC-Header: Dst Switch]", "[IP-Header]", "[TCP-Header]", "HTTP Data", "[CRC Trailer]"]
  },
  {
    step: 5,
    layerNumber: 1,
    layerName: "Schicht 1: Bitübertragungsschicht",
    pduName: "Bits (Signale)",
    addedHeader: "Physikalische Modulation (Spannung / Licht / Funk)",
    explanation: "Der gesamte Frame wird in eine Folge von Nullen und Einsen codiert und über das Medium gesendet.",
    payloadVisual: ["01001000 01110100 01110100 01110000 00111010... (Rohe Bits)"]
  }
];

export const PRESENTATION_SLIDES = [
  {
    slideNumber: 1,
    title: "OSI-Modell",
    subtitle: "Netzwerkkommunikation in 7 Schichten",
    badge: "FISI Umschulung – Comcave",
    bullets: [
      "Referenzmodell für herstellerübergreifende Netzwerkkommunikation",
      "Vorbereitung für das IHK-Fachgespräch Fachinformatiker Systemintegration",
      "Team: Patrick, Bastian, Issa, Thomas, Adem"
    ]
  },
  {
    slideNumber: 2,
    title: "Was ist das OSI-Modell?",
    subtitle: "Historie & Grundlagen",
    badge: "ISO 1984 Standard",
    bullets: [
      "1984 von der ISO (International Organization for Standardization) entwickelt",
      "Ziel: Herstellerunabhängige Kommunikation proprietärer Systeme (z.B. IBM vs. DEC)",
      "Aufteilung komplexer Netzwerkprozesse in 7 klar definierte Schichten",
      "Jede Schicht erbringt Dienste für die darüberliegende Schicht"
    ]
  },
  {
    slideNumber: 3,
    title: "Die 7 Schichten im Überblick",
    subtitle: "Von der Anwendung bis zum Kabel",
    badge: "7 Schichten Architektur",
    bullets: [
      "Schicht 7: Anwendungsschicht (Application Layer)",
      "Schicht 6: Darstellungsschicht (Presentation Layer)",
      "Schicht 5: Sitzungsschicht (Session Layer)",
      "Schicht 4: Transportschicht (Transport Layer)",
      "Schicht 3: Vermittlungsschicht (Network Layer)",
      "Schicht 2: Sicherungsschicht (Data Link Layer)",
      "Schicht 1: Bitübertragungsschicht (Physical Layer)"
    ]
  },
  {
    slideNumber: 4,
    title: "Layer 2 & Layer 1: Lokales Netz & Physik",
    subtitle: "Data Link & Physical Layer",
    badge: "Hardwarenah",
    bullets: [
      "Layer 2: Switches, MAC-Adressen (48-Bit), Ethernet-Frames, CRC-Fehlerprüfung",
      "Layer 1: Bitübertragung, Kupferkabel (Twisted Pair), LWL (Glasfaser), WLAN Funk",
      "Kernregel: Ohne funktionierenden Layer 1 existiert keine Netzwerkverbindung!"
    ]
  },
  {
    slideNumber: 5,
    title: "Layer 3: Vermittlungsschicht",
    subtitle: "Network Layer & Routing",
    badge: "Globale Adressierung",
    bullets: [
      "IP-Adressierung (IPv4 / IPv6) und logische Subnetze",
      "Router analysieren Ziel-IP und wählen den optimalen Pfad (Routing)",
      "Protokolle: IP, ICMP (Ping, TraceRoute), Routing-Protokolle (OSPF, BGP)"
    ]
  },
  {
    slideNumber: 6,
    title: "Layer 4: Transportschicht",
    subtitle: "Transport Layer & End-to-End Steuerung",
    badge: "Segmente & Ports",
    bullets: [
      "TCP: Verbindungsorientiert, zuverlässig, 3-Way-Handshake, Flusskontrolle, ACKs",
      "UDP: Verbindungslos, schnell, minimaler Overhead (Streaming, VoIP, DNS)",
      "Portnummern (0–65535) adressieren konkrete Anwendungen auf dem Zielhost"
    ]
  },
  {
    slideNumber: 7,
    title: "Layer 6 & Layer 5: Darstellung & Sitzung",
    subtitle: "Presentation & Session Layer",
    badge: "Formate & Sitzungen",
    bullets: [
      "Layer 6: Datenformatierung (ASCII, Unicode, JPEG), TLS-Verschlüsselung, Kompression",
      "Layer 5: Sitzungssteuerung – Verbindungen aufbauen, halten, synchronisieren, beenden",
      "Wiederaufnahme nach Verbindungsabbrüchen ohne vollständigen Neustart"
    ]
  },
  {
    slideNumber: 8,
    title: "Layer 7: Anwendungsschicht",
    subtitle: "Application Layer & Nutzerschnittstelle",
    badge: "Tor zum Netzwerk",
    bullets: [
      "Direkte Schnittstelle zu Benutzeranwendungen (Browser, Mail-Client, Terminal)",
      "Standardprotokolle: HTTP/HTTPS (Web), SMTP/IMAP (Mail), DNS, SSH, DHCP",
      "Anwendung übergibt Rohdaten an Schicht 6 ohne Wissen über die Übertragungsstrecke"
    ]
  },
  {
    slideNumber: 9,
    title: "OSI vs. TCP/IP Modell",
    subtitle: "Theorie vs. Praxis im Internet",
    badge: "Modellvergleich",
    bullets: [
      "OSI-Modell: 7 Schichten, herstellerneutrales theoretisches Referenzmodell",
      "TCP/IP-Modell: 4 Schichten (Anwendung, Transport, Internet, Netzzugang)",
      "OSI Schichten 7, 6 und 5 werden in TCP/IP zur 'Anwendungsschicht' zusammengefasst",
      "OSI Schichten 2 und 1 bilden die 'Netzzugangsschicht'"
    ]
  },
  {
    slideNumber: 10,
    title: "Kapselung (Encapsulation)",
    subtitle: "Der Weg der Daten durch die Schichten",
    badge: "Header & Trailer",
    bullets: [
      "Sender (oben nach unten): Jede Schicht fügt ihren eigenen Header hinzu",
      "HTTP Data → +TCP-Header (Segment) → +IP-Header (Paket) → +MAC-Header (Frame) → Bits",
      "Empfänger (unten nach oben): Header werden schrittweise entfernt (Entkapselung)"
    ]
  },
  {
    slideNumber: 11,
    title: "Strukturiertes Troubleshooting",
    subtitle: "Die Methode für Fachinformatiker",
    badge: "IHK Best Practice",
    bullets: [
      "Bottom-Up Ansatz: Fehlersuche beginnt immer bei Schicht 1 (Kabel, Link-LED)",
      "Layer 2: Switch-Ports, VLAN-Zugehörigkeit, MAC-Filter, ARP-Tabelle",
      "Layer 3: IP-Adresse, Subnetzmaske, Default Gateway, DNS, Routing-Tabelle",
      "Layer 4: Zielport blockiert? Firewall-Regeln? TCP Handshake erfolgreich?",
      "Layer 5–7: Dienst läuft? TLS-Zertifikat gültig? Anwendungsfehler?"
    ]
  },
  {
    slideNumber: 12,
    title: "Fazit & Zusammenfassung",
    subtitle: "Bedeutung für die IHK-Prüfung",
    badge: "Vielen Dank",
    bullets: [
      "OSI ist das unverzichtbare Denkmodell für jeden Fachinformatiker Systemintegration",
      "Ermöglicht methodische Fehleranalyse statt unstrukturiertem Raten",
      "Herzlichen Dank für Ihre Aufmerksamkeit – bereit für Fragen!"
    ]
  }
];

// Helper calculations
export function calculateTotalDuration(scenes: PresentationScene[]): number {
  return scenes.reduce((acc, scene) => acc + scene.durationSeconds, 0);
}

export function formatSecondsToTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function parseTimeToSeconds(timeStr: string): number {
  const parts = timeStr.split(":").map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

export function calculateWordsPerMinute(scriptText: string, durationSeconds: number): number {
  if (durationSeconds <= 0) return 0;
  // Clean markdown and non-verbal tokens like [text]
  const cleaned = scriptText.replace(/\[.*?\]/g, "").replace(/[#*>-]/g, " ").trim();
  const words = cleaned.split(/\s+/).filter(Boolean).length;
  const minutes = durationSeconds / 60;
  return Math.round(words / minutes);
}

export function generateFfmpegCommand(options: {
  inputFile?: string;
  outputFile?: string;
  resolution?: string;
  crf?: number;
  audioBitrate?: string;
}): string {
  const input = options.inputFile || "input.mp4";
  const output = options.outputFile || "OSI_Modell_Comcave_720p_12min.mp4";
  const scale = options.resolution === "1080p" ? "1920:1080" : "1280:720";
  const crf = options.crf ?? 20;
  const audioBitrate = options.audioBitrate || "192k";

  return `ffmpeg -i ${input} \\
  -c:v libx264 \\
  -preset medium \\
  -crf ${crf} \\
  -scale ${scale} \\
  -c:a aac \\
  -b:a ${audioBitrate} \\
  -ar 48000 \\
  -movflags +faststart \\
  ${output}`;
}

export function validatePresentationSchedule(scenes: PresentationScene[]): {
  isValid: boolean;
  totalDurationSeconds: number;
  totalDurationFormatted: string;
  errors: string[];
} {
  const errors: string[] = [];
  const totalDurationSeconds = calculateTotalDuration(scenes);

  if (totalDurationSeconds > 720) {
    errors.push(`Gesamtlänge (${totalDurationSeconds}s) überschreitet das Maximum von 720s (12:00 Minuten).`);
  }

  // Check continuity
  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    if (scene.startSeconds >= scene.endSeconds) {
      errors.push(`Szene ${scene.sceneNumber} hat ungültige Zeitgrenzen (${scene.timeStart} bis ${scene.timeEnd}).`);
    }
    if (i > 0) {
      const prev = scenes[i - 1];
      if (prev.endSeconds !== scene.startSeconds) {
        errors.push(`Lücke oder Überschneidung zwischen Szene ${prev.sceneNumber} und Szene ${scene.sceneNumber}.`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    totalDurationSeconds,
    totalDurationFormatted: formatSecondsToTime(totalDurationSeconds),
    errors
  };
}

export const CARTESIA_VOICE_PRESETS: CartesiaVoiceConfig[] = [
  {
    id: "a0e99841-438c-4a64-b679-ae501e7d6091",
    name: "Sonic German – Patrick (Professioneller Sprecher)",
    gender: "male",
    language: "de",
    recommendedRole: "Einleitung & Layer 7",
    description: "Klarer, souveräner, professioneller Vortragsstil für Einleitung und Schicht 7"
  },
  {
    id: "79a125e8-cd45-4c13-8a67-188112f4dd22",
    name: "Sonic German – Bastian (Ruhig & Strukturiert)",
    gender: "male",
    language: "de",
    recommendedRole: "Layer 6 & Layer 5 / TCP-IP",
    description: "Ruhiger, verständlicher Erklärton für Protokollformate und Sitzungen"
  },
  {
    id: "846d3cb9-059d-4511-80c1-584742a8b98b",
    name: "Sonic German – Issa (Dynamisch & Präzise)",
    gender: "male",
    language: "de",
    recommendedRole: "Layer 4 & Layer 3",
    description: "Fokussiert, zügig und präzise für TCP/UDP-Segmente und IP-Routing"
  },
  {
    id: "5c42302d-19c9-4673-90d2-8b438343ab88",
    name: "Sonic German – Thomas (Hardware & Technik)",
    gender: "male",
    language: "de",
    recommendedRole: "Layer 2 & Layer 1",
    description: "Tiefe, sachliche Stimme für Switch-Hardware, MAC-Adressen und Bit-Signale"
  },
  {
    id: "694f9389-aac1-45b6-b726-9d9369183238",
    name: "Sonic German – Adem (Experte & Troubleshooting)",
    gender: "male",
    language: "de",
    recommendedRole: "Praxis, Kapselung & Fazit",
    description: "Überzeugender, kompetenter Fachgespräch-Tonfall für Kapselung und Fehlersuche"
  },
  {
    id: "156fb8d2-335b-4950-9cb3-a2d33fad7777",
    name: "Sonic German – Erzähler (Allrounder)",
    gender: "male",
    language: "de",
    recommendedRole: "Allgemein",
    description: "Universelle deutsche Sprechstimme für alle Segmente und Voice-Overs"
  }
];

export function extractYouTubeId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(regExp);
  return match ? match[1] : null;
}

export function buildCartesiaPrompt(
  speaker: string,
  rawScript: string,
  voiceConfig?: CartesiaVoiceConfig,
  speed: number = 1.0,
  emotion: string = "calm, professional"
): CartesiaPrompt {
  const matchedVoice =
    voiceConfig ||
    CARTESIA_VOICE_PRESETS.find(v => v.name.toLowerCase().includes(speaker.toLowerCase())) ||
    CARTESIA_VOICE_PRESETS.find(v => v.recommendedRole.toLowerCase().includes(speaker.toLowerCase())) ||
    CARTESIA_VOICE_PRESETS[0];

  const cleanScript = rawScript
    .replace(/\[.*?\]/g, "")
    .replace(/^[>#-]\s*/gm, "")
    .replace(/\n{2,}/g, "\n\n")
    .trim();

  const payload = {
    model_id: "sonic-multilingual",
    transcript: cleanScript,
    voice: {
      mode: "id",
      id: matchedVoice.id,
      __experimental_controls: {
        speed: speed,
        emotion: [emotion]
      }
    },
    output_format: {
      container: "wav",
      sample_rate: 24000,
      encoding: "pcm_s16le"
    },
    language: "de"
  };

  const payloadJson = JSON.stringify(payload, null, 2);

  const curlCommand = `curl -X POST "https://api.cartesia.ai/tts/bytes" \\
  -H "X-API-Key: $CARTESIA_API_KEY" \\
  -H "Cartesia-Version: 2024-06-10" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(payload)}' \\
  --output "segment_${speaker.toLowerCase()}.wav"`;

  return {
    voiceId: matchedVoice.id,
    voiceName: matchedVoice.name,
    model: "sonic-multilingual",
    language: "de",
    speed: speed,
    emotion: emotion,
    cleanScript,
    pronunciationNotes: [
      "OSI = O-S-I buchstabieren",
      "ISO = I-S-O buchstabieren",
      "TCP = T-C-P (Tee-Cee-Pee)",
      "UDP = U-D-P",
      "HTTP / HTTPS = H-T-T-P / H-T-T-P-S",
      "MAC = M-A-C oder Mäck-Adresse",
      "LUFS = L-U-F-S"
    ],
    samplePayloadJson: payloadJson,
    sampleCurlCommand: curlCommand
  };
}

