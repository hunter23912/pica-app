import { useState } from "react";

type LoginDialogProps = {
  open: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
};

export function LoginDialog({ open, onClose, onLogin }: LoginDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!open) {
    // 如果对话框没有打开，则不渲染任何内容
    return null;
  }

  const handleSubmit = async () => {
    await onLogin(email, password);
    setPassword("");
    onClose();
  };

  return (
    <div className="dialog-backdrop">
      <div className="dialog">
        <h2>账号登录</h2>
        <input
          value={email}
          onChange={(event) => setEmail(event.currentTarget.value)}
          placeholder="邮箱"
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.currentTarget.value)}
          placeholder="密码"
        />
        <div className="dialog-actions">
          <button onClick={onClose}>取消</button>
          <button onClick={handleSubmit}>登录</button>
        </div>
      </div>
    </div>
  );
}
