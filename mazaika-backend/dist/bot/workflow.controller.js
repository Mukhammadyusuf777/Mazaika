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
exports.WorkflowController = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../firebase/firebase.service");
let WorkflowController = class WorkflowController {
    firebaseService;
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async getWorkflow(botId) {
        const docRef = this.firebaseService.db.collection('bots').doc(botId).collection('workflows').doc('main');
        const snap = await docRef.get();
        if (!snap.exists) {
            const data = {
                name: 'Asosiy Ssenariy',
                botId,
                isMain: true,
                nodes: '[]',
                edges: '[]'
            };
            await docRef.set(data);
            return { ...data, nodes: [], edges: [] };
        }
        const data = snap.data();
        if (!data)
            return { nodes: [], edges: [] };
        return {
            ...data,
            nodes: data.nodes ? JSON.parse(data.nodes) : [],
            edges: data.edges ? JSON.parse(data.edges) : []
        };
    }
    async updateWorkflow(botId, body) {
        const docRef = this.firebaseService.db.collection('bots').doc(botId).collection('workflows').doc('main');
        const data = {
            nodes: JSON.stringify(body.nodes || []),
            edges: JSON.stringify(body.edges || []),
            updatedAt: new Date()
        };
        await docRef.set(data, { merge: true });
        return {
            nodes: body.nodes,
            edges: body.edges
        };
    }
};
exports.WorkflowController = WorkflowController;
__decorate([
    (0, common_1.Get)(':botId'),
    __param(0, (0, common_1.Param)('botId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "getWorkflow", null);
__decorate([
    (0, common_1.Put)(':botId'),
    __param(0, (0, common_1.Param)('botId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "updateWorkflow", null);
exports.WorkflowController = WorkflowController = __decorate([
    (0, common_1.Controller)('workflows'),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], WorkflowController);
//# sourceMappingURL=workflow.controller.js.map