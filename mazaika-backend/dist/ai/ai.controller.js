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
exports.AiController = exports.PatchDto = exports.GenerateDto = void 0;
const common_1 = require("@nestjs/common");
const antigravity_service_1 = require("./antigravity.service");
class GenerateDto {
    prompt;
}
exports.GenerateDto = GenerateDto;
class PatchDto {
    prompt;
    currentPage;
    selectedBlockId;
    currentConfig;
}
exports.PatchDto = PatchDto;
let AiController = class AiController {
    antigravityService;
    constructor(antigravityService) {
        this.antigravityService = antigravityService;
    }
    async generateFullProject(dto) {
        return this.antigravityService.generateFullProject(dto.prompt);
    }
    async generatePatch(dto) {
        return this.antigravityService.generatePatch(dto.prompt, dto.currentPage, dto.selectedBlockId, dto.currentConfig);
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Post)('generate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GenerateDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "generateFullProject", null);
__decorate([
    (0, common_1.Post)('patch'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PatchDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "generatePatch", null);
exports.AiController = AiController = __decorate([
    (0, common_1.Controller)('api/ai'),
    __metadata("design:paramtypes", [antigravity_service_1.AntigravityService])
], AiController);
//# sourceMappingURL=ai.controller.js.map