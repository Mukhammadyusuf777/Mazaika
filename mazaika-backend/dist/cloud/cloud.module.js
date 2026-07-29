"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudModule = void 0;
const common_1 = require("@nestjs/common");
const mazaika_db_service_1 = require("./mazaika-db.service");
const mazaika_engine_service_1 = require("./mazaika-engine.service");
const mazaika_hosting_controller_1 = require("./mazaika-hosting.controller");
let CloudModule = class CloudModule {
};
exports.CloudModule = CloudModule;
exports.CloudModule = CloudModule = __decorate([
    (0, common_1.Module)({
        controllers: [mazaika_hosting_controller_1.MazaikaHostingController],
        providers: [mazaika_db_service_1.MazaikaDbService, mazaika_engine_service_1.MazaikaEngineService],
        exports: [mazaika_db_service_1.MazaikaDbService, mazaika_engine_service_1.MazaikaEngineService]
    })
], CloudModule);
//# sourceMappingURL=cloud.module.js.map