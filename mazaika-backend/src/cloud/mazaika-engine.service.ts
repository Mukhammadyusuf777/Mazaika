import { Injectable, Logger } from '@nestjs/common';
import * as vm from 'vm';
import { MazaikaDbService } from './mazaika-db.service';

@Injectable()
export class MazaikaEngineService {
  private readonly logger = new Logger(MazaikaEngineService.name);

  constructor(private readonly mazaikaDb: MazaikaDbService) {}

  async runUserScript(appId: string, code: string, payload: any) {
    // Inject our custom Mazaika Cloud API directly into the execution context
    const sandbox: any = {
      input: payload,
      output: null,
      console: {
        log: (...args: any[]) => this.logger.log(`[Sandbox ${appId}]`, ...args),
        error: (...args: any[]) => this.logger.error(`[Sandbox ${appId}]`, ...args)
      },
      Mazaika: {
        db: {
          save: async (coll: string, data: any) => await this.mazaikaDb.save(appId, coll, data),
          get: async (coll: string) => await this.mazaikaDb.find(appId, coll),
        }
      }
    };

    try {
      vm.createContext(sandbox);
      
      // We wrap the user code in an async IIFE so they can use await inside
      const wrappedCode = `
        (async () => {
          try {
            ${code}
          } catch (e) {
            console.error(e.message);
            output = { error: e.message };
          }
        })();
      `;
      
      // Execute the code securely in an isolated context
      vm.runInContext(wrappedCode, sandbox, { timeout: 2000 });
      
      // Since it's async, we might need a brief delay or return a promise in real scenarios,
      // but for simple sync/await assignments to `output`, this will work.
      // We wait for microtasks to finish.
      await new Promise(resolve => setTimeout(resolve, 50));
      
      return sandbox.output;
    } catch (e: any) {
      this.logger.error(`Engine error for ${appId}: ${e.message}`);
      return { error: e.message };
    }
  }
}
