import {
  InitializeParams,
  DidChangeConfigurationNotification,
  TextDocumentSyncKind,
  InitializeResult,
  IConnection,
  ClientCapabilities,
  NotificationHandler,
  DidChangeConfigurationParams,
  createConnection,
  ProposedFeatures,
  TextDocuments,
  TextDocumentPositionParams,
  CompletionItem,
  CompletionItemKind,
} from 'vscode-languageserver';
import {
  Settings,
  defaultSettings,
  FileSettings,
  defaultFileSettings,
} from './defaultSettingsAndInterfaces';

import { TextDocument } from 'vscode-languageserver-textdocument';

export function CreateServer() {
  new AssemblyLsp(createConnection(ProposedFeatures.all));
}
export class AssemblyLsp {
  documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

  hasConfigurationCapability = false;

  hasDiagnosticRelatedInformationCapability = false;

  globalSettings: Settings = defaultSettings;
  documentSettings: Map<string, Thenable<Settings>> = new Map();
  constructor(public connection: IConnection) {
    // NOTE use arrow function or use .bind(this)
    connection.onInitialize(this.onInitialize);
    connection.onInitialized(this.onInitialized);
    connection.onDidChangeConfiguration(this.onDidChangeConfiguration);
    connection.onCompletion(this.onCompletion);
    connection.onDidOpenTextDocument(async ({ textDocument }) => {
      // TODO
    });

    this.documents.onDidClose((e) => {
      this.documentSettings.delete(e.document.uri);
    });

    this.documents.listen(connection);

    connection.listen();
  }

  private onInitialize = ({ capabilities }: InitializeParams): InitializeResult => {
    this.hasConfigurationCapability = this.getHasConfigurationCapability(capabilities);

    this.hasDiagnosticRelatedInformationCapability = this.getHasDiagnosticRelatedInformationCapability(
      capabilities
    );

    const result: InitializeResult = {
      capabilities: {
        textDocumentSync: TextDocumentSyncKind.Incremental,
        completionProvider: {
          resolveProvider: false,
        },
      },
    };
    return result;
  };

  private onInitialized = () => {
    if (this.hasConfigurationCapability) {
      this.connection.client.register(DidChangeConfigurationNotification.type, undefined);
    }
  };

  private onDidChangeConfiguration: NotificationHandler<DidChangeConfigurationParams> = (
    change
  ) => {
    if (this.hasConfigurationCapability) {
      this.documentSettings.clear();
    } else {
      this.globalSettings = <Settings>(change.settings.languageServerExample || defaultSettings);
    }
  };

  private onCompletion = async ({
    position,
    textDocument,
  }: TextDocumentPositionParams): Promise<CompletionItem[]> => {
    const settings = await this.getDocumentEditorSettings(textDocument.uri);
    const document = this.documents.get(textDocument.uri);
    if (!document) return [];

    const line = document.getText({ start: { character: 0, line: position.line }, end: position });
    const firstWord = line.replace(/^[\t ]*([^\t ]+).*/, '$1');
    this.connection.console.log(firstWord);

    return [
      {
        label: '"""""TEST TEST  """""',
        kind: CompletionItemKind.Text,
        data: 1,
      },
      {
        label: 'TEST 2',
        kind: CompletionItemKind.Text,
        data: 2,
      },
    ];
  };

  private getHasConfigurationCapability(capabilities: ClientCapabilities): boolean {
    return !!(capabilities.workspace && !!capabilities.workspace.configuration);
  }

  private getHasDiagnosticRelatedInformationCapability(capabilities: ClientCapabilities): boolean {
    return !!(
      capabilities.textDocument &&
      capabilities.textDocument.publishDiagnostics &&
      capabilities.textDocument.publishDiagnostics.relatedInformation
    );
  }
  /**gets the editor settings of the given uri. */
  private async getDocumentEditorSettings(uri: string): Promise<FileSettings> {
    if (!this.hasConfigurationCapability) {
      return defaultFileSettings;
    }

    return {
      ...defaultFileSettings,
      ...(await this.connection.workspace.getConfiguration({
        scopeUri: uri,
        section: 'editor',
      })),
    };
  }
}
