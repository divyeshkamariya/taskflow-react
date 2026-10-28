import { useEffect, useRef, useState } from "react";
import { Download, FlaskConical, Trash2, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import { createBackup, parseBackup } from "../utils/storage";
import { createSampleTasks } from "../utils/sampleData";

// Name, backup (export / import JSON), demo data and "delete everything"
export default function SettingsModal({ name, tasks, onSaveName, onReplaceTasks, onClose }) {
  const [draftName, setDraftName] = useState(name);
  const fileInput = useRef(null);

  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const saveName = (event) => {
    event.preventDefault();
    onSaveName(draftName.trim().slice(0, 40));
    toast.success("Name saved");
  };

  const exportTasks = () => {
    const blob = new Blob([createBackup(tasks)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `taskflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Backup downloaded");
  };

  const importTasks = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow choosing the same file again
    if (!file) return;

    try {
      if (file.size > 2 * 1024 * 1024) throw new Error("File is too large (max 2 MB).");
      const imported = parseBackup(await file.text());

      if (
        !window.confirm(
          `Replace your ${tasks.length} current task(s) with ${imported.length} from this file?`,
        )
      ) {
        return;
      }
      onReplaceTasks(imported);
      toast.success(`Imported ${imported.length} task(s)`);
      onClose();
    } catch (error) {
      toast.error(error.message || "Could not import this file.");
    }
  };

  const loadSamples = () => {
    if (
      tasks.length > 0 &&
      !window.confirm("This replaces your current tasks with sample data. Continue?")
    ) {
      return;
    }
    onReplaceTasks(createSampleTasks());
    toast.success("Sample tasks loaded");
    onClose();
  };

  const clearAll = () => {
    if (!window.confirm("Delete ALL tasks? This cannot be undone. (Export a backup first!)"))
      return;
    onReplaceTasks([]);
    toast.success("All tasks deleted");
    onClose();
  };

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <div className="modal-head">
          <h2 id="settings-title">Settings</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close settings">
            <X size={20} />
          </button>
        </div>

        <div className="task-form">
          <form onSubmit={saveName} className="settings-name">
            <label>
              Your name
              <input
                value={draftName}
                maxLength={40}
                placeholder="e.g. Rahul"
                onChange={(e) => setDraftName(e.target.value)}
              />
            </label>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </form>

          <p className="settings-note">
            TaskFlow has no server. Your {tasks.length} task(s) are saved only in this browser, so
            export a backup before clearing browser data or switching devices.
          </p>

          <div className="settings-actions">
            <button type="button" className="btn btn-secondary" onClick={exportTasks}>
              <Download size={16} /> Export backup
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => fileInput.current?.click()}
            >
              <Upload size={16} /> Import backup
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              hidden
              aria-label="Import backup file"
              onChange={importTasks}
            />
            <button type="button" className="btn btn-secondary" onClick={loadSamples}>
              <FlaskConical size={16} /> Load sample data
            </button>
            <button type="button" className="btn btn-danger" onClick={clearAll}>
              <Trash2 size={16} /> Delete all tasks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
