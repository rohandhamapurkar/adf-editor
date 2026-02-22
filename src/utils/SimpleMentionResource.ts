import { AbstractMentionResource } from '@atlaskit/mention';

const mentions = [
  {
    id: '1',
    name: 'Rohan Dhamapurkar',
    mentionName: 'rohan',
    nickname: 'rohan',
    avatarUrl: '',
  },
  {
    id: '2',
    name: 'Trae AI',
    mentionName: 'trae',
    nickname: 'trae',
    avatarUrl: '',
  },
];

export class SimpleMentionResource extends AbstractMentionResource {
  filter(query?: string) {
    if (!query) {
      this._notifyListeners({ mentions: mentions, query: '' });
      this._notifyAllResultsListeners({ mentions: mentions, query: '' });
      return Promise.resolve();
    }

    const lowerQuery = query.toLowerCase();
    const filtered = mentions.filter((m) =>
      m.name.toLowerCase().includes(lowerQuery) ||
      m.mentionName.toLowerCase().includes(lowerQuery) ||
      m.nickname.toLowerCase().includes(lowerQuery)
    );

    this._notifyListeners({ mentions: filtered, query });
    this._notifyAllResultsListeners({ mentions: filtered, query });
    return Promise.resolve();
  }
}

export const mentionResourceProvider = new SimpleMentionResource();
