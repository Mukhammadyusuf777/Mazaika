"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MazaikaHostingController = void 0;
const common_1 = require("@nestjs/common");
const mazaika_db_service_1 = require("./mazaika-db.service");
let MazaikaHostingController = class MazaikaHostingController {
    db;
    constructor(db) {
        this.db = db;
    }
    async renderSite(slug) {
        const siteData = await this.db.find('global', `site_${slug}`);
        if (!siteData || siteData.length === 0) {
            return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Mazaika Hosting</title>
          <style>
            body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f0f2f5; margin: 0; }
            .card { background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
            h1 { color: #2563eb; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Mazaika Cloud Hosting</h1>
            <p>Site <b>${slug}</b> is active and ready for AI deployment.</p>
          </div>
        </body>
        </html>
      `;
        }
        return siteData[0].html || siteData[0];
    }
};
exports.MazaikaHostingController = MazaikaHostingController;
__decorate([
    (0, common_1.Get)('sites/:siteSlug'),
    (0, common_1.Header)('Content-Type', 'text/html'),
    __param(0, (0, common_1.Param)('siteSlug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MazaikaHostingController.prototype, "renderSite", null);
exports.MazaikaHostingController = MazaikaHostingController = __decorate([
    (0, common_1.Controller)('cloud'),
    __metadata("design:paramtypes", [mazaika_db_service_1.MazaikaDbService])
], MazaikaHostingController);
//# sourceMappingURL=mazaika-hosting.controller.js.map