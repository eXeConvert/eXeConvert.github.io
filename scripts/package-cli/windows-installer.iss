#define MyAppName "eXeConvert CLI"
#define MyAppVersion GetEnv("EXE_VERSION")
#define MyArch GetEnv("EXE_ARCH")
#define MySourceDir GetEnv("EXE_BUNDLE_DIR")
#define MyOutputDir GetEnv("EXE_OUTPUT_DIR")

[Setup]
AppId={{E2ED3EC8-9F17-4F1B-9961-5C6D39B8E910}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
DefaultDirName={autopf}\eXeConvert
DisableProgramGroupPage=yes
OutputDir={#MyOutputDir}
OutputBaseFilename=execonvert-{#MyAppVersion}-{#MyArch}-setup
Compression=lzma
SolidCompression=yes
ChangesEnvironment=yes
; The wizard speaks the language of Windows when it is one of these, English
; otherwise, and asks only when it cannot tell.
ShowLanguageDialog=auto

[Languages]
Name: "en"; MessagesFile: "compiler:Default.isl"
Name: "es"; MessagesFile: "compiler:Languages\Spanish.isl"
Name: "ca"; MessagesFile: "compiler:Languages\Catalan.isl"
; Galician and Basque are not shipped with Inno Setup: these are its
; user-contributed translations (see THIRD_PARTY_NOTICES.md).
Name: "gl"; MessagesFile: "inno-languages\Galician.isl"
Name: "eu"; MessagesFile: "inno-languages\Basque.isl"

[Messages]
; Inno's own closing words point to "the installed shortcuts", which tells
; nothing about a command-line program. This file is UTF-8 with BOM, as Inno
; Setup needs for these accents.
en.FinishedLabel=[name] is installed. To use it, open it from the Start menu: a window opens with the help, where you can type the commands.
es.FinishedLabel=[name] ya está instalado. Para usarlo, ábrelo desde el menú Inicio: se abrirá una ventana con la ayuda, donde puedes escribir las órdenes.
ca.FinishedLabel=[name] ja està instal·lat. Per fer-lo servir, obre'l des del menú Inici: s'obrirà una finestra amb l'ajuda, on pots escriure les ordres.
gl.FinishedLabel=[name] xa está instalado. Para usalo, ábreo desde o menú Inicio: abrirase unha xanela coa axuda, onde podes escribir as ordes.
eu.FinishedLabel=[name] instalatuta dago. Erabiltzeko, ireki Hasiera menutik: laguntza duen leiho bat irekiko da, eta bertan aginduak idatz ditzakezu.

[Files]
Source: "{#MySourceDir}\*"; DestDir: "{app}"; Flags: recursesubdirs ignoreversion

[Icons]
; A command-line program shows its help and waits there: launching
; execonvert.cmd alone would flash a window that closes before it can be read.
; cmd strips the outer quotes of what follows /k, hence the doubled ones.
Name: "{autoprograms}\eXeConvert CLI"; Filename: "{cmd}"; Parameters: "/k """"{app}\execonvert.cmd"" --help"""; WorkingDir: "{userdocs}"

[Registry]
Root: HKCU; Subkey: "Environment"; ValueType: expandsz; ValueName: "Path"; ValueData: "{olddata};{app}"; Check: NeedsAddPath(ExpandConstant('{app}'))

[Code]
function NeedsAddPath(Param: string): boolean;
var
  OrigPath: string;
begin
  if not RegQueryStringValue(HKCU, 'Environment', 'Path', OrigPath) then
  begin
    Result := True;
    exit;
  end;
  Result := Pos(';' + Uppercase(Param) + ';', ';' + Uppercase(OrigPath) + ';') = 0;
end;
