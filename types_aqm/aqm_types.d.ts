import { ITraderBase, ITraderAssort } from "@spt-aki/models/eft/common/tables/ITrader";
import { IQuest } from "@spt-aki/models/eft/common/tables/IQuest";

export interface IAQMDatabase {
    BarterOnly: {
        QuestBundles: Record<string, IAQMQuestBundle>;
        TradersAssort: IAQMTraders;
    }
    locales_traders: IAQMLocales;
    QuestBundles: Record<string, IAQMQuestBundle>
    traders: IAQMTraders;
    TradersAssort: IAQMTraders;
}

export interface IAQMQuestBundle {
    Bashkir_Temporal_Id?:   IAQMQuestBundleTrader;
    Colonel_Temporal_Id?:   IAQMQuestBundleTrader;
    Elder_Temporal_Id?:     IAQMQuestBundleTrader;
    Khokhol_Temporal_Id?:   IAQMQuestBundleTrader;
    LabRat_Temporal_Id?:    IAQMQuestBundleTrader;
    Warden_Temporal_Id?:    IAQMQuestBundleTrader;    
}

export interface IAQMQuestBundleTrader {
    locales: Record<string, Record<string, string>>;
    quests: IQuest;
}

export interface IAQMTraders {
    "5a7c2eca46aef81a7ca2145d"?:    IAQMTrader;
    "5ac3b934156ae10c4430e83c"?:    IAQMTrader;
    "5c0647fdd443bc2504c2d371"?:    IAQMTrader;
    "54cb50c76803fa8b248b4571"?:    IAQMTrader;
    "54cb57776803fa99248b456e"?:    IAQMTrader;
    "5935c25fb3acc3127c3d8cd9"?:    IAQMTrader;
    "58330581ace78e27b8b10cee"?:    IAQMTrader;
    Bashkir_Temporal_Id?:           IAQMTrader;
    Colonel_Temporal_Id?:           IAQMTrader;
    Elder_Temporal_Id?:             IAQMTrader;
    Khokhol_Temporal_Id?:           IAQMTrader;
    LabRat_Temporal_Id?:            IAQMTrader;
    Warden_Temporal_Id?:            IAQMTrader;
}

export interface IAQMTrader {
    base?: ITraderBase;
    assort: ITraderAssort;
    questassort?: Record<string, Record<string, string>>;
}

export interface IAQMLocales {
    ch:         IAQMLocalesTraders;
    cz:         IAQMLocalesTraders;
    en:         IAQMLocalesTraders;
    es:         IAQMLocalesTraders;
    "es-mx":    IAQMLocalesTraders;
    fr:         IAQMLocalesTraders;
    ge:         IAQMLocalesTraders;
    hu:         IAQMLocalesTraders;
    it:         IAQMLocalesTraders;
    jp:         IAQMLocalesTraders;
    pl:         IAQMLocalesTraders;
    po:         IAQMLocalesTraders;
    ru:         IAQMLocalesTraders;
    sk:         IAQMLocalesTraders;
    tu:         IAQMLocalesTraders;
}

export interface IAQMLocalesTraders {
    Bashkir_Temporal_Id: Record<string, string>;
    Colonel_Temporal_Id: Record<string, string>;
    Elder_Temporal_Id: Record<string, string>;
    Khokhol_Temporal_Id: Record<string, string>;
    LabRat_Temporal_Id: Record<string, string>;
    Warden_Temporal_Id: Record<string, string>;
}