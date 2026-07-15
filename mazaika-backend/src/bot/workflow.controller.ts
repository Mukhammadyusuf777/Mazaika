import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Controller('workflows')
export class WorkflowController {
  constructor(private firebaseService: FirebaseService) {}

  @Get(':botId')
  async getWorkflow(@Param('botId') botId: string) {
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
    if (!data) return { nodes: [], edges: [] };
    return {
      ...data,
      nodes: data.nodes ? JSON.parse(data.nodes) : [],
      edges: data.edges ? JSON.parse(data.edges) : []
    };
  }


  @Put(':botId')
  async updateWorkflow(
    @Param('botId') botId: string,
    @Body() body: { nodes: any[], edges: any[] }
  ) {
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
}
