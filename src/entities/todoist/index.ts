export interface Project {
    id: number
    order: number
    color: number
    name: string
    comment_count: number
};

export interface Task {
    id: number;
    project_id: number;
    section_id: number;
    order: number;
    content: string;
    description?: string;
    parent_id?: number;
    completed: boolean;
    label_ids: number[];
    priority: number;
    create: string;
    url: string;
};

export interface Note {
    id: number;
    legacy_id: number;
    posted_uid: number;
    item_id: number;
    legacy_item_id: number;
    project_id: number;
    legacy_project_id: number;
    content: string;
    file_attachment: FileAttachment;
    uids_to_notify: number[];
    is_deleted: number;
    posted: string;
    reactions: Record<string, number[]>;
};

export interface FileAttachment {
    file_name: string;
    file_size: number;
    file_type: string;
    file_url: string;
    upload_state: string;
}
