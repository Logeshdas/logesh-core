import TextDatasource from "../datasources/TextDatasource";
import { fireInstantiationHandlers, registerDatasource } from "../datasources/register";
import Credentials from "../credentials/Credentials";
import { getCredentials } from "../credentials/channel";
import LocalStorageInterface from "./LocalStorageInterface";
import { DatasourceLoadedData, EncryptedContent, History } from "../types";

const TYPE = "localstorage";

/**
 * Local Storage datasource
 * @augments TextDatasource
 * @memberof module:Buttercup
 */
export default class LocalStorageDatasource extends TextDatasource {
    _property: string;
    _storage: LocalStorageInterface;

    /**
     * Constructor for the datasource
     * @param credentials The credentials instance with which to
     *  use to configure the datasource
     */
    constructor(credentials: Credentials) {
        super(credentials);
        const { data: credentialData } = getCredentials(credentials.id);
        const { datasource: datasourceConfig } = credentialData;
        const { property } = datasourceConfig;
        this._property = property;
        this._storage = new LocalStorageInterface();
        this.type = TYPE;
        fireInstantiationHandlers(TYPE, this);
    }

    /**
     * Load from a local-storage property
     * @param credentials The credentials for decryption
     * @returns A promise resolving with vault history
     * @memberof LocalStorageDatasource
     */
    async load(credentials: Credentials): Promise<DatasourceLoadedData> {
        const readVault = await this._storage.getValue("vault");
        if (!readVault) {
            throw new Error("No vault in storage");
        }
        this.setContent(readVault);
        return super.load(credentials);
    }

    /**
     * Save vault history to local-storage
     * @param history The vault history to save
     * @param credentials The credentials to save with
     * @returns A promise that resolves when saving is complete
     * @memberof LocalStorageDatasource
     */
    save(history: History, credentials: Credentials): Promise<EncryptedContent> {
        return super.save(history, credentials).then(async encrypted => {
            await this._storage.setValue("vault", encrypted);
            return encrypted;
        });
    }

    /**
     * Whether or not the datasource supports attachments
     * @memberof LocalStorageDatasource
     */
    supportsAttachments(): boolean {
        return false;
    }
}

registerDatasource(TYPE, LocalStorageDatasource);
