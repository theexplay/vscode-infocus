import axios, { AxiosInstance } from "axios";
import { v4 } from "uuid";
import { Project, Task, Note, Section } from "./entities";
import { Integration } from "../../lib/constants";
import { getApiToken } from "../../lib/tokenService";
import { Id } from "../../lib/listToTree";
import { v8 as TodoistApi } from 'todoist';

// TODO: migrate to api from todoist https://github.com/romgrk/node-todoist/issues/26
export const todoistApi = TodoistApi(getApiToken(Integration.todoist)!);

interface SyncResponse {
    items: Task[];
    projects: Project[];
    notes: Note[];
    project_notes: Note[];
    sections: Section[];
}

enum TodoistApiCommandType {
    ItemComplete = 'item_complete',
    ItemUncomplete = 'item_uncomplete',
    ItemAdd = 'item_add',
}


const SYNC_TOKEN_DEFAULT = "*";

class ApiClient {
    private readonly axiosInstance: AxiosInstance;

    /**
     * Используется sync тк в рест нет некоторых функций, таких как получение выполненных туду и тд
     * @see https://developer.todoist.com/sync/v8/
     */
    host = 'https://api.todoist.com/sync/v8';

    commonUri = `${this.host}/sync`;

    completedUri = `${this.host}/completed/get_all`;

    sync_token = SYNC_TOKEN_DEFAULT;

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
                    sync_token: req?.params?.sync_token ?? this.sync_token
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

    async getAllResources(forceUpdate: boolean) {
        const { data } = await this.axiosInstance.post<SyncResponse>(this.commonUri, {
            resource_types: ["projects", "items", "notes", "sections"],
            params: {
                sync_token: forceUpdate ? SYNC_TOKEN_DEFAULT : undefined
            }
        });

        const { items, projects, notes, project_notes, sections } = data;

        return {
            items,
            notes,
            projects,
            sections,
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

    // completed = 1 | 0
    async toggleTask(id: number, completed: number) {
        return this.axiosInstance.post<SyncResponse>(this.commonUri, {
            commands: [
                {
                    type: !!completed ? TodoistApiCommandType.ItemUncomplete : TodoistApiCommandType.ItemComplete,
                    uuid: v4(),
                    args: {
                        id,
                    }
                }
            ]
        });
    }
}

export const apiClient = new ApiClient();
