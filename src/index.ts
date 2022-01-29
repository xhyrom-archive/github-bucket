//import { WebhookEvent, EventPayloads } from '@octokit/webhooks'
import { Probot } from 'probot';
//import command from './structures/Command';

const verified = new Set([56601352, 68066476]);

export default (app: Probot) => {
  app.on(['issues.opened'], (context) => {
    const user = context.payload.sender.login;

    const issueComment = context.issue({
      body: [
        `Hey @${user}! Thank you for opening the issue. However, we are not machines, so it may take us a while to get back to you.`,
        ``,
        `But if you don't want to report a problem, please contact our [discord server](https://discord.gg/AjKJSBbGm2)`
      ].join('\n')
    });

    context.octokit.issues.createComment(issueComment).catch(e => e);
  });

  app.on(['issues.closed', 'issues.reopened', 'pull_request.closed', 'pull_request.reopened'], async(context) => {
    const issueComment = context.issue({
      body: context.payload.action === 'closed' ? 'I\'m locking the conversation so as not to create unnecessary controversy. Use `/unlock` to unlock' : 'I\'m unlocking the conversation. Use `/lock` to lock'
    });

    if (context.payload.action === 'closed') {
      await context.octokit.issues.createComment(issueComment).catch(e => e);
      context.octokit.issues.lock(context.issue()).catch(e => e);
    } else {
      await context.octokit.issues.unlock(context.issue()).catch(e => e);
      context.octokit.issues.createComment(issueComment).catch(e => e);
    };
  })

  app.on(['pull_request.opened','pull_request.reopened'], (context) => {
    context.octokit.pulls.requestReviewers(context.pullRequest({ reviewers: ['xHyroM'] })).catch(e => e);
  })

  app.on(['issue_comment.created'], async (context) => {
		type IssueWithPullRequestPayload = typeof context.payload.issue & {
			pull_request: Record<PropertyKey, unknown> | undefined;
		};

    if (context.isBot) {
			return;
		}

    if (context.payload.action === 'created' && (context.payload.issue as IssueWithPullRequestPayload).pull_request && verified.has(context.payload.sender.id)) {
      const content = context.payload.comment.body.toLowerCase();
      const fulldata = await context.octokit.pulls.get(context.pullRequest());

      if (content === '@garlic-team pack' && fulldata.data.head.repo) {
				await context.octokit.actions.createWorkflowDispatch({
					workflow_id: 'next-release.yml',
					owner: context.payload.repository.owner.name ?? 'Garlic-Team',
					repo: context.payload.repository.name,
					ref: 'next',
					inputs: {
						prNumber: context.payload.issue.number.toString(),
						ref: fulldata.data.head.ref
					}
				});

				const replyMessage = context.issue({
					body: [
						`Hey @${context.payload.sender.login}, I've started workflow for the build.`,
						`You can see it [here](https://github.com/${context.payload.repository.full_name}/actions/workflows/next-release.yml)!`,
            `\`\`\`sh`,
            `npm install gcommands@pr-${context.payload.issue.number}`,
            `\`\`\``
					].join('\n')
				});

				await context.octokit.issues.createComment(replyMessage);
      }
    }
  })

  /*app.on('issue_comment.created', async(context) => {
    const allReviewers = await context.octokit.pulls.listRequestedReviewers(context.pullRequest());

    if (!allReviewers.data.users.some(user => user.id === context.payload.comment.user.id)) return;

    if(context.payload.comment.body.includes(`${context.payload.repository.html_url}/issues`)) {
      const issueId = context.payload.comment.body.split('/').slice(-1)?.[0];
      if (!issueId) return;

      context.octokit.issues.addLabels(context.issue({
        issue_number: parseInt(issueId),
        labels: ['s: has PR']
      })).catch(e => e);
    }
  })*/

  //command(app, 'review', (context: WebhookEvent<EventPayloads.WebhookPayloadIssues> & Omit<Context<any>, keyof WebhookEvent<any>>, command: { arguments: string; }) => {
    //const labels = command.arguments.split(/, */);

    /*console.log(labels)
    context.octokit.pulls.createReview(context.pullRequest({ event: 'APPROVE' }));
    return context.octokit.issues.addLabels(context.issue({ labels }));
  })*/
};
