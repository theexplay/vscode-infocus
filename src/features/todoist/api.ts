import axios, { AxiosInstance } from "axios";
import { Project, Task, Note } from "../../entities/todoist";
import { Integration } from "../../lib/constants";
import { getApiToken } from "../../lib/tokenService";

interface SyncResponse {
    items: Task[];
    projects: Project[];
    notes: Note[];
    project_notes: Note[];
}

class ApiClient {
    private readonly axiosInstance: AxiosInstance;

    /**
     * Используется sync тк в рест нет некоторых функций, таких как получение выполненных туду и тд
     * @see https://developer.todoist.com/sync/v8/
     */
    host = 'https://api.todoist.com/sync/v8';

    commonUri = `${this.host}/sync`;

    completedUri = `${this.host}/completed/get_all`;

    sync_token = '*';

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: this.host,
            withCredentials: true,
        });

        this.axiosInstance.interceptors.request.use((req) => {
            return {
                ...req,
                headers: {
                    ...req?.headers,
                    Authorization: `Bearer ${getApiToken(Integration.todoist)}`,
                },
                params: {
                    ...req.params,
                    sync_token: this.sync_token
                },
            };
        })

        this.axiosInstance.interceptors.response.use((res) => {
            if (res.data.sync_token) {
                this.sync_token = res.data.sync_token;
            };

            return res;
        })
    }

    async getAllResources() {
        const { data } = await this.axiosInstance.post<SyncResponse>(this.commonUri, {
            resource_types: ["projects", "items", "notes"],
        });

        const { items, projects, notes, project_notes } = data;

        return {
            items,
            notes,
            projects,
            project_notes
        }
    }

    async getAllCompletedResources() {
        const { data } = await this.axiosInstance.post<SyncResponse>(this.completedUri, {
            params: {
                resource_types: ["projects", "items", "notes"],
                limit: 10,
            }
        });

        const { items, projects, notes, project_notes } = data;

        return {
            items,
            notes,
            projects,
            project_notes
        }
    }
}

export const apiClient = new ApiClient();
