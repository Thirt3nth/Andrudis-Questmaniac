"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ConfigTypes_1 = require("C:/snapshot/project/obj/models/enums/ConfigTypes");
const QuestRewardType_1 = require("C:/snapshot/project/obj/models/enums/QuestRewardType");
const Traders_1 = require("C:/snapshot/project/obj/models/enums/Traders");
//trader configs
const bashkirBaseJson = __importStar(require("../db/traders/6765fbd20fdc7eb79b00000b/base.json"));
const colonelBaseJson = __importStar(require("../db/traders/6765fbd20fdc7eb79b00000c/base.json"));
const elderBaseJson = __importStar(require("../db/traders/6765fbd20fdc7eb79b00000d/base.json"));
const khokholBaseJson = __importStar(require("../db/traders/6765fbd20fdc7eb79b00000e/base.json"));
const labratBaseJson = __importStar(require("../db/traders/6765fbd20fdc7eb79b00000f/base.json"));
const wardenBaseJson = __importStar(require("../db/traders/6765fbd20fdc7eb79b00000a/base.json"));
const config = __importStar(require("../src/config.json"));
"use strict"; // eslint-disable-line @typescript-eslint/no-unused-expressions
// DB au lieu de AKI
class QuestManiac {
    mod;
    logger;
    itemBaseClassService;
    itemHelper;
    //private enabledTraders: object = {};
    constructor() {
        this.mod = "zzzzAndrudis-QuestManiac";
    }
    preSptLoad(container) {
        this.logger = container.resolve("WinstonLogger");
        //Populate enabledTraders object
        /*
        for (const traderName in config.TradersEnabled)
        {
            const traderID: string = this.traderNamesToIDs[traderName];

            this.enabledTraders[traderID] = config.TradersEnabled[traderName];
        }*/
        this.logger.debug(`[${this.mod}] Loading... `);
        this.registerProfileImage(container);
        this.setupTraderUpdateTime(container);
        this.logger.debug(`[${this.mod}] Loaded`);
    }
    // DB AKI
    postDBLoad(container) {
        this.logger = container.resolve("WinstonLogger");
        this.logger.debug(`[${this.mod}] Delayed Loading... `);
        this.logger.info("[AQM] Loading...");
        //Server database variables
        const databaseServer = container.resolve("DatabaseServer");
        const databaseImporter = container.resolve("ImporterUtil");
        const hashUtil = container.resolve("HashUtil");
        const PostSptModLoader = container.resolve("PostSptModLoader");
        const configServer = container.resolve("ConfigServer");
        //const traderConfig = configServer.getConfig<ITraderConfig>(ConfigTypes.TRADER)
        const ragfairConfig = configServer.getConfig(ConfigTypes_1.ConfigTypes.RAGFAIR);
        this.itemBaseClassService = container.resolve("ItemBaseClassService");
        this.itemHelper = container.resolve("ItemHelper");
        const unsupportedLocales = ["ch", "cz", "es", "es-mx", "hu", "it", "pl", "po", "sk", "tu"];
        //Get the SPT database and the AQM custom database
        const database = databaseServer.getTables();
        const aqmDb = databaseImporter.loadRecursive(`${PostSptModLoader.getModPath(this.mod)}db/`);
        //const aqmDb = this.getModDatabase(`./${PostSptModLoader.getModPath(this.mod)}db/`);
        const locales = database.locales.global;
        //Add all traders to SPT database
        for (const trader in aqmDb.traders) {
            //Skip adding the trader if they are disabled in config:
            //if (!this.enabledTraders[trader]) continue;
            //Remove trader item requirements if configured
            const questAssort = config.AllTradesAvailableFromStart ?
                { started: {}, success: {}, fail: {} } :
                aqmDb.traders[trader].questassort;
            database.traders[trader] = {
                base: aqmDb.traders[trader].base,
                assort: aqmDb.traders[trader].assort,
                questassort: questAssort
            };
            Traders_1.Traders[trader] = trader;
            ragfairConfig.traders[trader] = true;
        }
        this.logger.info("[AQM] Traders loaded");
        //Add all quests to database
        for (const bundle in aqmDb.QuestBundles) {
            this.logger.info("[AQM] Adding Quest Bundle: " + bundle);
            for (const trader in aqmDb.QuestBundles[bundle]) {
                //Skip adding the quest bundle to the trader if they are disabled in config:
                //if (!this.enabledTraders[trader]) continue;
                //quests.json file reference
                const questsFile = aqmDb.QuestBundles[bundle][trader].quests;
                for (const quest of Object.keys(questsFile)) {
                    const questContent = questsFile[quest];
                    //Add trader loyalty rewards if configured
                    if (config.AddTraderLoyaltyReward == true) {
                        const loyaltyReward = {
                            "value": "0.01",
                            "id": hashUtil.generate(),
                            "type": QuestRewardType_1.QuestRewardType.TRADER_STANDING,
                            "index": questContent.rewards.Success.length,
                            "target": trader
                        };
                        questContent.rewards.Success.push(loyaltyReward);
                    }
                    //process quest condition configuration options
                    for (const nextCondition of questContent.conditions.AvailableForFinish) {
                        const nextConditionData = nextCondition;
                        if (nextConditionData.type == "Elimination") {
                            for (const subCondition of nextConditionData.counter.conditions) {
                                const subConditionData = subCondition;
                                //Replaces raider kill with PMC kills if configured
                                if (config.ReplaceKillCounterForRaidersWithPMCs && subConditionData.conditionType == "Kills") {
                                    if (subConditionData.target == "Savage") {
                                        if (subConditionData.savageRole != null && subConditionData.savageRole[0] == "pmcBot") {
                                            subConditionData.target = "AnyPmc";
                                            subConditionData.savageRole = null;
                                        }
                                    }
                                }
                                //Remove all map restrictions if configured
                                if (config.RemoveAllMapsRestrictions && subConditionData.conditionType == "Location") {
                                    subConditionData.target = ["factory4_day", "factory4_night", "bigmap", "Interchange",
                                        "lighthouse", "privatearea", "RezervBase", "Shoreline", "tarkovstreets",
                                        "suburbs", "terminal", "laboratory", "town", "Woods", "Sandbox"];
                                }
                                //Remove all gear restrictions if configured
                                if (config.RemoveAllGearRestrictions && subConditionData.conditionType == "Equipment") {
                                    subConditionData.equipmentInclusive = [];
                                }
                            }
                        }
                    }
                    //Override starting requirements if configured
                    if (config.AllQuestsAvailableFromStart) {
                        questContent.conditions.AvailableForStart = [{
                                "conditionType": "Level",
                                "compareMethod": ">=",
                                "value": "1",
                                "index": 0,
                                "parentId": "",
                                "id": "AllQuestsAvailable-LevelCondition",
                                "dynamicLocale": false
                            }];
                    }
                    //Special thanks to @November75  for this fix
                    this.fixRewardsSuccessItemID(questContent, hashUtil);
                    if (bundle === 'Errand Boy') {
                        this.fixErrandQuests(questContent);
                    }
                    if (bundle !== "Hideout Assistant Lite" && config.rewardScaling && config.rewardScaling !== 1) {
                        this.fixRewardScaling(questContent);
                    }
                    //Insert quest into database
                    database.templates.quests[questContent._id] = questContent;
                }
            }
        }
        this.logger.info("[AQM] Quests loaded");
        //Add all locales to SPT database
        for (const bundle in aqmDb.QuestBundles) {
            for (const trader in aqmDb.QuestBundles[bundle]) {
                //Skip adding the trader if they are disabled in config:
                //if (!this.enabledTraders[trader]) continue;
                for (const locale in aqmDb.QuestBundles[bundle][trader].locales) {
                    //BulkFile import
                    const localeData = aqmDb.QuestBundles[bundle][trader].locales[locale];
                    for (const localeDataEntry of Object.keys(localeData)) {
                        const subFileContent = localeData[localeDataEntry];
                        locales[locale][localeDataEntry] = subFileContent;
                        if (locale == "en") {
                            for (const ul in unsupportedLocales) {
                                const ulName = unsupportedLocales[ul];
                                locales[ulName][localeDataEntry] = subFileContent;
                            }
                        }
                    }
                }
            }
        }
        for (const locale in aqmDb.locales_traders) {
            for (const trader in aqmDb.locales_traders[locale]) {
                //Skip adding the trader if they are disabled in config:
                //if (!this.enabledTraders[trader]) continue;
                const traderLocale = aqmDb.locales_traders[locale][trader];
                for (const entry of Object.keys(traderLocale)) {
                    locales[locale][entry] = traderLocale[entry];
                }
            }
        }
        this.logger.info("[AQM] Locales loaded");
        //Add gamma pouch to set quest if configured
        if (config.ShouldAddGammaContainer) {
            this.logger.info("[AQM] Adding Gamma Pouch quest");
            for (const nextQuest in database.templates.quests) {
                const questData = database.templates.quests[nextQuest];
                if (questData._id == config.QuestIdForGammaContainer) {
                    const gammaReward = {
                        "target": "reward_Gamma",
                        "value": "1",
                        "type": QuestRewardType_1.QuestRewardType.ITEM,
                        "index": 99,
                        "id": "Gamma_Container_Reward",
                        "items": [
                            {
                                "_id": "reward_Gamma",
                                "_tpl": "5857a8bc2459772bad15db29",
                                "upd": { "StackObjectsCount": 1 }
                            }
                        ]
                    };
                    questData.rewards.Success.push(gammaReward); //type error here because SPT default types are wrong --> Reward extends Item when it shouldn't
                }
            }
        }
        if (config.OverrideTradersDiscounts == true) {
            this.logger.info("[AQM] Overriding Trader Discounts");
            database.traders[bashkirBaseJson._id].base.discount = config.TradersDiscounts.Bashkir;
            database.traders[colonelBaseJson._id].base.discount = config.TradersDiscounts.Colonel;
            database.traders[elderBaseJson._id].base.discount = config.TradersDiscounts.Elder;
            database.traders[khokholBaseJson._id].base.discount = config.TradersDiscounts.Khokhol;
            database.traders[labratBaseJson._id].base.discount = config.TradersDiscounts.LabRat;
            database.traders[wardenBaseJson._id].base.discount = config.TradersDiscounts.Warden;
        }
        //patch handover issues for 'HK MP5SD Upper receiver'
        for (const itemIndex in database.templates.items) {
            const dbItem = database.templates.items[itemIndex];
            if (dbItem._id === "5926f2e086f7745aae644231") {
                for (const slotIndex in dbItem._props.Slots) {
                    dbItem._props.Slots[slotIndex]._required = false;
                }
            }
        }
        this.logger.debug(`[${this.mod}] Delayed Loaded`);
        this.logger.info("[AQM] Loaded successfully");
    }
    fixErrandQuests(questContent) {
        for (const finishCond of questContent.conditions?.AvailableForFinish) {
            //I wanted to make this work for quests like 'bring 3 civil headwear' too
            //but other traders have very different errand quests. Sometimes they want a very specific item,
            //sometimes - an item of a class. No easy way to distinguish. Only length of target array, but even then...
            if (finishCond.conditionType === "HandoverItem" && questContent.QuestName.lastIndexOf('Mechanic') > 0) {
                // this function returns the whole hierarchy of base items.
                //i.e. for "Glock Pachmayr Tactical Grip Glove" it returns:
                //["Pistol grip", "Essential mod", "Weapon mod", "Compound item", "undefined"]
                //We need only the narrowest base item. I assume it's the first element of the array
                const targetType = this.itemBaseClassService.getItemBaseClasses(finishCond.target[0])[0];
                if (targetType === undefined || targetType.lastIndexOf("Armor") > 0) {
                    continue;
                }
                finishCond.target = [];
                for (const item of this.itemHelper.getItems()) {
                    if (this.itemHelper.isOfBaseclass(item._id, targetType)) {
                        finishCond.target.push(item._id);
                    }
                }
            }
        }
    }
    fixRewardScaling(questContent) {
        if (questContent.rewards && questContent.rewards.Success) {
            for (const success of questContent.rewards.Success) {
                if (success.items && success.items.length === 1) {
                    const item = success.items[0];
                    if (item._tpl === '5449016a4bdc2d6f028b456f' ||
                        item._tpl === '5696686a4bdc2da3298b456a' ||
                        item._tpl === '569668774bdc2da2298b4568') {
                        const rewardScaling = config.rewardScaling;
                        const newReward = Math.round(item.upd.StackObjectsCount * rewardScaling);
                        item.upd.StackObjectsCount = newReward;
                        success.value = `${newReward}`;
                    }
                }
            }
        }
    }
    //function of original mod
    fixRewardsSuccessItemID(questContent, hashUtil) {
        if (questContent.rewards && questContent.rewards.Success) {
            for (const success of questContent.rewards.Success) {
                if (success.items) {
                    for (const item of success.items) {
                        const oldID = item._id;
                        const newID = hashUtil.generate();
                        item._id = newID;
                        // change all same id this items array
                        // find same parentId
                        for (const childItem of success.items) {
                            if (childItem.parentId && childItem.parentId === oldID) {
                                childItem.parentId = newID;
                            }
                        }
                        // change target
                        if (success.target === oldID) {
                            success.target = newID;
                        }
                    }
                }
            }
        }
    }
    registerProfileImage(container) {
        // Reference the mod "res" folder
        const PreSptModLoader = container.resolve("PreSptModLoader");
        const imageFilepath = `./${PreSptModLoader.getModPath(this.mod)}res`;
        // Register route pointing to the profile picture
        const imageRouter = container.resolve("ImageRouter");
        imageRouter.addRoute(bashkirBaseJson.avatar.replace(".jpg", ""), `${imageFilepath}/traders/${this.traderNamesToIDs.Bashkir}.jpg`);
        imageRouter.addRoute(colonelBaseJson.avatar.replace(".jpg", ""), `${imageFilepath}/traders/${this.traderNamesToIDs.Colonel}.jpg`);
        imageRouter.addRoute(elderBaseJson.avatar.replace(".jpg", ""), `${imageFilepath}/traders/${this.traderNamesToIDs.Elder}.jpg`);
        imageRouter.addRoute(khokholBaseJson.avatar.replace(".jpg", ""), `${imageFilepath}/traders/${this.traderNamesToIDs.Khokhol}.jpg`);
        imageRouter.addRoute(labratBaseJson.avatar.replace(".jpg", ""), `${imageFilepath}/traders/${this.traderNamesToIDs.LabRat}.jpg`);
        imageRouter.addRoute(wardenBaseJson.avatar.replace(".jpg", ""), `${imageFilepath}/traders/${this.traderNamesToIDs.Warden}.jpg`);
    }
    setupTraderUpdateTime(container) {
        // Add refresh time in seconds when Config server allows to set configs
        const configServer = container.resolve("ConfigServer");
        const traderConfig = configServer.getConfig(ConfigTypes_1.ConfigTypes.TRADER);
        const bashkirRefreshConfig = { traderId: bashkirBaseJson._id, seconds: { min: 1000, max: 6000 } };
        const colonelRefreshConfig = { traderId: colonelBaseJson._id, seconds: { min: 1000, max: 6000 } };
        const elderRefreshConfig = { traderId: elderBaseJson._id, seconds: { min: 1000, max: 6000 } };
        const khokholRefreshConfig = { traderId: khokholBaseJson._id, seconds: { min: 1000, max: 6000 } };
        const labratRefreshConfig = { traderId: labratBaseJson._id, seconds: { min: 1000, max: 6000 } };
        const wardenRefreshConfig = { traderId: wardenBaseJson._id, seconds: { min: 1000, max: 6000 } };
        traderConfig.updateTime.push(bashkirRefreshConfig);
        traderConfig.updateTime.push(colonelRefreshConfig);
        traderConfig.updateTime.push(elderRefreshConfig);
        traderConfig.updateTime.push(khokholRefreshConfig);
        traderConfig.updateTime.push(labratRefreshConfig);
        traderConfig.updateTime.push(wardenRefreshConfig);
    }
    traderNamesToIDs = {
        Bashkir: "6765fbd20fdc7eb79b00000b",
        Colonel: "6765fbd20fdc7eb79b00000c",
        Elder: "6765fbd20fdc7eb79b00000d",
        Khokhol: "6765fbd20fdc7eb79b00000e",
        LabRat: "6765fbd20fdc7eb79b00000f",
        Warden: "6765fbd20fdc7eb79b00000a"
    };
}
module.exports = { mod: new QuestManiac() };
//# sourceMappingURL=mod.js.map