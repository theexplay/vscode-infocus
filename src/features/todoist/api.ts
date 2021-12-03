import { v8 as TodoistApi } from 'todoist';
import { Integration } from "../../lib/constants";
import { getApiToken } from "../../lib/tokenService";

export const todoistApi = TodoistApi(getApiToken(Integration.todoist)!);
