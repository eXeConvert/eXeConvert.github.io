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

[Files]
Source: "{#MySourceDir}\*"; DestDir: "{app}"; Flags: recursesubdirs ignoreversion

[Icons]
Name: "{autoprograms}\eXeConvert CLI"; Filename: "{app}\execonvert.cmd"

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
