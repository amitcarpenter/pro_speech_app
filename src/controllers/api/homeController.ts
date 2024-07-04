import { Request, Response } from 'express';
import Home, { IHome } from '../../models/HomePageContent';

const APP_URL = process.env.APP_URL as string

// Create operation (POST)
export const createHome = async (req: Request, res: Response) => {
    try {
        console.log("helllo api call ")
        const homeVidoeData = await Home.find()
        if (homeVidoeData.length > 0) {
            return res.status(400).json({
                succuss: false,
                status: 400,
                message: "Video already uplaoded"
            })
        }
        let home_video = null
        if (req.file) {
            console.log(req.file)

            home_video = req.file.filename
        }
        const newHome: IHome = new Home({ home_video });
        await newHome.save();
        res.status(201).json(newHome);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Read operation - Get all homes (GET)
export const getAllHomes = async (req: Request, res: Response): Promise<void> => {
    try {
        const homes: IHome[] = await Home.find();
        res.status(200).json(homes);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Read operation - Get a single home by ID (GET)
export const getHomeById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const home: IHome | null = await Home.findById(id);
        if (!home) {
            res.status(404).json({ message: 'Home not found' });
            return;
        }
        res.status(200).json(home);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Update operation (PUT)
export const updateHome = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { home_video } = req.body;
        const updatedHome: IHome | null = await Home.findByIdAndUpdate(id, { home_video }, { new: true });
        if (!updatedHome) {
            res.status(404).json({ message: 'Home not found' });
            return;
        }
        res.status(200).json(updatedHome);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

