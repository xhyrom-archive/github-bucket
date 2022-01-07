import { WebhookEvent, EventPayloads } from '@octokit/webhooks'
import { Probot, Context } from 'probot';
import command from './structures/Command';

export default (app: Probot) => {
  app.on('issues.opened', async (context) => {
    const user = context.payload.sender.login;

    const issueComment = context.issue({
      body: [
        `Hey @${user}! Thank you for opening the issue. However, we are not machines, so it may take us a while to get back to you.`,
        ``,
        `But if you don't want to report a problem, please contact our [discord server](https://discord.gg/AjKJSBbGm2)`
      ].join('\n')
    });

    await context.octokit.issues.createComment(issueComment);
  });

  app.on(['issues.closed', 'issues.reopened'], async(context) => {

    if (context.payload.action === 'closed') context.octokit.issues.lock(context.issue());
    else context.octokit.issues.unlock(context.issue());
  })

  app.on('pull_request.opened', (context) => {
    context.octokit.pulls.requestReviewers(context.pullRequest({ reviewers: ['xHyroM'] }));
  })

  //command(app, 'review', (context: WebhookEvent<EventPayloads.WebhookPayloadIssues> & Omit<Context<any>, keyof WebhookEvent<any>>, command: { arguments: string; }) => {
    //const labels = command.arguments.split(/, */);

    /*console.log(labels)
    context.octokit.pulls.createReview(context.pullRequest({ event: 'APPROVE' }));
    return context.octokit.issues.addLabels(context.issue({ labels }));
  })*/
};
