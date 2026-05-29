import { useEffect, useState } from "react";
import type { Config } from "../types";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { getDefaultDownloadDir } from "../api/shell";

type SettingsDialogProps = {
  open: boolean;
  config: Config;
  onClose: () => void;
  onSave: (config: Config) => Promise<void>;
};

export function SettingsDialog({
  open,
  config,
  onClose,
  onSave,
}: SettingsDialogProps) {
  const [draftConfig, setDraftConfig] = useState(config);
  const [error, setError] = useState("");
  const [defaultDownloadDir, setDefaultDownloadDir] = useState("");

  useEffect(() => {
    if (open) {
      setDraftConfig(config);
      setError("");
      getDefaultDownloadDir()
        .then(setDefaultDownloadDir)
        .catch((error) => setError(String(error)));
    }
  }, [open, config]);

  if (!open) {
    return null;
  }

  const validateConfig = () => {
    if (
      !Number.isInteger(draftConfig.chapterConcurrency) ||
      draftConfig.chapterConcurrency < 1
    ) {
      return "章节并发数必须是大于0的整数";
    }

    if (
      !Number.isInteger(draftConfig.imageConcurrency) ||
      draftConfig.imageConcurrency < 1
    ) {
      return "图片并发数必须是大于0的整数";
    }

    return "";
  };

  const handleSave = async () => {
    const validationError = validateConfig();

    if (validationError) {
      setError(validationError);
      return;
    }

    await onSave(draftConfig);
    onClose();
  };

  const handlePickDownloadDir = async () => {
    const selected = await openDialog({
      directory: true,
      multiple: false,
    });
    if (typeof selected !== "string") {
      return;
    }

    setDraftConfig({
      ...draftConfig,
      downloadDir: selected,
    });
  };

  return (
    <div className="dialog-backdrop">
      <div className="dialog settings-dialog">
        <h2>设置</h2>
        <label className="form-field">
          <span>下载目录</span>
          <div className="field-row">
            <input
              value={draftConfig.downloadDir}
              onChange={(event) =>
                setDraftConfig({
                  ...draftConfig,
                  downloadDir: event.currentTarget.value,
                })
              }
              placeholder="下载目录"
            />

            <button onClick={handlePickDownloadDir}>选择目录</button>
          </div>

          <p className="field-help">
            默认目录：{defaultDownloadDir || "加载中..."}
          </p>
        </label>
        <label className="form-field">
          <span>章节并发数</span>
          <input
            type="number"
            min={1}
            value={draftConfig.chapterConcurrency}
            onChange={(event) =>
              setDraftConfig({
                ...draftConfig,
                chapterConcurrency: Number(event.currentTarget.value),
              })
            }
          />
        </label>

        <label className="form-field">
          <span>图片并发数</span>
          <input
            type="number"
            min={1}
            value={draftConfig.imageConcurrency}
            onChange={(event) =>
              setDraftConfig({
                ...draftConfig,
                imageConcurrency: Number(event.currentTarget.value),
              })
            }
          />
        </label>
        {error && <p className="error-text">{error}</p>}
        <div className="dialog-actions">
          <button onClick={onClose}>取消</button>
          <button onClick={handleSave}>保存</button>
        </div>
      </div>
    </div>
  );
}
