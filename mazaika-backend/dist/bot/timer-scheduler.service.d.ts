import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { WorkflowService } from './workflow.service';
export declare class TimerSchedulerService implements OnModuleInit, OnModuleDestroy {
    private firebaseService;
    private workflowService;
    private readonly logger;
    private intervalId;
    constructor(firebaseService: FirebaseService, workflowService: WorkflowService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    checkExpiredTimers(): Promise<void>;
}
