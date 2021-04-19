import { CalculatedUserVote, UsersVote } from "../contexts/graph/types";

export const calculateVoteByUsers = (usersVote: UsersVote): CalculatedUserVote => {
    const calculatedUsersVote: CalculatedUserVote = {};
    
    Object.keys(usersVote).forEach((nftId: string) => { 
        const upvote = Object.values(usersVote[nftId]).filter(item => item.upvote).reduce((sum, item) => {
            sum += item?.upvote ?? 0;
            return sum;
        }, 0);

        const downvote = Object.values(usersVote[nftId]).filter(item => item.downvote).reduce((sum, item) => {
            sum += item.downvote || 1;
            return sum;
        }, 0);

        calculatedUsersVote[nftId] = {upvote, downvote};
    });

    return calculatedUsersVote;
}

export const calculateVoteByUser = (usersVote: UsersVote, id: string): CalculatedUserVote => {
    const calculatedUsersVote: CalculatedUserVote = {};
    
    const upvote = Object.values(usersVote).filter(item => item.upvote).reduce((sum, item) => {
        // @ts-ignore
        sum += item?.upvote ?? 0;
        return sum;
    }, 0);

    const downvote = Object.values(usersVote).filter(item => item.downvote).reduce((sum, item) => {
        // @ts-ignore
        sum += item.downvote || 1;
        return sum;
    }, 0);

    calculatedUsersVote[id] = {upvote, downvote};

    return calculatedUsersVote;
}