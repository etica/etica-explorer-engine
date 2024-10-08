// Webhooks.js
const axios = require('axios');

class Webhooks {
  static async discord_new_proposal(proposal, webhookUrl) {
    const data = proposal.data;
    console.log('sending new discord webhook proposal:', proposal);
    console.log('sending new discord webhook data:', data);
    try {
      const payload = {
        content: `New Etica Proposal: ${proposal.title}`,
        embeds: [{
          title: proposal.title,
          description: proposal.description.substring(0, 2048), // Discord has a 2048 character limit for embed descriptions
          color: 3447003, // Blue color
          fields: [
            {
              name: "Proposal Hash",
              value: data.proposed_release_hash,
              inline: true
            },
            {
                name: "Disease Hash",
                value: proposal.diseasehash,
                inline: false
            },
            {
                name: "Chunk",
                value: proposal.chunkid,
                inline: true
            },
            {
              name: "Proposer",
              value: proposal.proposer,
              inline: false
            },
            {
                name: "IPFS Hash",
                value: proposal.raw_release_hash,
                inline: false
            },
            {
              name: "Voting Starts",
              value: new Date(data.starttime * 1000).toUTCString(),
              inline: false
            },
            {
              name: "Voting Ends",
              value: new Date(data.endtime * 1000).toUTCString(),
              inline: false
            },
            {
                name: "Approval Threshold",
                value: data.approvalthreshold,
                inline: false
            }
            
          ],
          url: `https://eticascan.org/proposal/${proposal.proposed_release_hash}`
        }]
      };

      console.log('sending new proposal webhook with payload:', payload);

      await axios.post(webhookUrl, payload);
      console.log('Discord webhook notification sent successfully');
    } catch (error) {
      console.error('Error sending Discord webhook notification:', error);
    }
  }
}

module.exports = Webhooks;