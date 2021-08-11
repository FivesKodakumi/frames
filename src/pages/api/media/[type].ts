import type {NextApiRequest, NextApiResponse} from 'next';
import {confirmContext} from "../auth";
import Springboard from "../../../../server/classes/springboard";
import {ListEditors} from "../../../../server/classes/listEditors";
import {MediaType} from '@prisma/client';
import {convertUrl} from "../../../../next/SSR";

const spring = new Springboard();
const list = new ListEditors();

export default async (req: NextApiRequest, res: NextApiResponse) => {
    let {userId} = confirmContext(req.cookies);

    if (req.method === 'POST'){
        res.status(400).json('Invalid request method');
        return;
    }

    let body = {...req.query};
    let response: any = {};
    if (body.type === 'find') {
        let type = body.media === 'MOVIE' ? MediaType.MOVIE: MediaType.SHOW;
        let name = !Array.isArray(body.name) ? body.name : '';
        response = await spring.findMedia(name, type);
    }

    else if (body.type === 'get') {
        let media_id = +(body.id);
        userId = userId === 'unknown' ? 'b4dd90c0-b611-433a-a141-141ab5705766': userId;
        response = await spring.getInfo(media_id, userId, false);
    }

    else if (body.type === 'list'){
        let media_id = +(body.id);
        response = false;
        if (userId !== 'unknown')
            response = await list.addToList(media_id, userId);
    }

    else if (body.type === 'seen') {
        let media_id = +(body.id);
        response = false;
        if (userId !== 'unknown')
            response = await spring.markAsSeen(media_id, userId);
    }

    else if (body.type === 'rate') {
        let media_id = +(body.id);
        let rate = +(body.rate);
        response = false;
        if (userId !== 'unknown')
            response = await list.rateThis(media_id, userId, rate);
    }

    else if (body.type === 'episodes') {
        let media_id = +(body.id);
        let season = +(body.season);
        if (userId !== 'unknown')
            response = await spring.getEpisodes(media_id, season, userId);
    }

    else if (body.type === 'prodPlaylist') {
        let companyId = !Array.isArray(body.id) ? body.id : '';
        companyId = convertUrl(companyId);
        response = null;
        if (userId !== 'unknown')
            response = await spring.createProdPlaylist(companyId, userId)
    }

    res.json(response)
}