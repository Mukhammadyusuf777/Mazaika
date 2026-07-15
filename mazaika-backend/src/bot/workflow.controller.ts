import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('workflows')
export class WorkflowController {
  constructor(private prisma: PrismaService) {}

  @Get(':botId')
  async getWorkflow(@Param('botId') botId: string) {
    let workflow = await this.prisma.workflow.findFirst({
      where: { botId, isMain: true }
    });

    if (!workflow) {
      // Create empty workflow if not exists
      workflow = await this.prisma.workflow.create({
        data: {
          name: 'Asosiy Ssenariy',
          botId,
          isMain: true,
          nodes: '[]',
          edges: '[]'
        }
      });
    }

    return {
      ...workflow,
      nodes: JSON.parse(workflow.nodes),
      edges: JSON.parse(workflow.edges)
    };
  }

  @Put(':botId')
  async updateWorkflow(
    @Param('botId') botId: string,
    @Body() body: { nodes: any[], edges: any[] }
  ) {
    const workflow = await this.prisma.workflow.findFirst({
      where: { botId, isMain: true }
    });

    if (!workflow) return { error: 'Workflow not found' };

    const updated = await this.prisma.workflow.update({
      where: { id: workflow.id },
      data: {
        nodes: JSON.stringify(body.nodes || []),
        edges: JSON.stringify(body.edges || [])
      }
    });

    return {
      ...updated,
      nodes: JSON.parse(updated.nodes),
      edges: JSON.parse(updated.edges)
    };
  }
}
