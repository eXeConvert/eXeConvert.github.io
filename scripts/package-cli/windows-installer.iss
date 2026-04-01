#define MyAppName "eXeConvert CLI"
#define MyAppVersion GetEnv("EXE_VERSION")
#define MySourceDir GetEnv("EXE_BUNDLE_DIR")
#define MyOutputDir GetEnv("EXE_OUTPUT_DIR")

[Setup]
AppId={{E2ED3EC8-9F17-4F1B-9961-5C6D39B8E910}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
DefaultDirName={autopf}\eXeConvert
DisableProgramGroupPage=yes
OutputDir={#MyOutputDir}
OutputBaseFilename=execonvert-{#MyAppVersion}-setup
Compression=lzma
SolidCompression=yes
ChangesEnvironment=yes

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
