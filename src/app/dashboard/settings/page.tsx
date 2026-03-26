import type { Metadata } from 'next'
import { verifySession } from '@/lib/dal'

export const metadata: Metadata = { title: 'Pengaturan | ex-POS' }

export default async function SettingsPage() {
  const session = await verifySession()

  return (
    <div className="animate-fade-in w-full">
      <div className="page-header mb-8 pb-4 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Pengaturan</h1>
        <p className="text-sm text-muted-foreground mt-1">Konfigurasi toko dan kelola detail akun Anda.</p>
      </div>

      <div className="w-full space-y-10">
        {/* Store Info */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground tracking-tight">Informasi Toko</h2>
            <p className="text-sm text-muted-foreground">Pengaturan organisasi dan detail publik.</p>
          </div>
          
          <div className="bg-card text-card-foreground border border-border/80 shadow-sm rounded-xl overflow-hidden w-full">
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Nama Toko</p>
                  <p className="text-sm font-medium text-foreground">{session.tenantName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">ID Organisasi</p>
                  <div className="inline-flex items-center gap-2 mt-0.5">
                     <span className="text-xs font-mono bg-muted/60 px-2 py-1 rounded-sm text-foreground border border-border/50">
                       expos.app/{session.tenantSlug}
                     </span>
                  </div>
                </div>
              </div>
              
              <div className="pt-5 border-t border-border/50">
                 <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Kode Server (Tenant ID)</p>
                 <p className="text-xs font-mono text-muted-foreground bg-accent/30 inline-block px-2 py-1 rounded-sm border border-border/40">
                   {session.tenantId}
                 </p>
              </div>
            </div>
            <div className="bg-muted/30 px-6 py-3 border-t border-border/80 flex justify-end gap-2">
              <button type="button" disabled className="btn-primary opacity-50 cursor-not-allowed">Edit Informasi</button>
            </div>
          </div>
        </section>

        {/* Account Info */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground tracking-tight">Akun Anda</h2>
            <p className="text-sm text-muted-foreground">Detail profil pengguna login Anda.</p>
          </div>
          
          <div className="bg-card text-card-foreground border border-border/80 shadow-sm rounded-xl overflow-hidden w-full">
            <div className="p-6 space-y-6">
              
              {/* Profile Header Block */}
              <div className="flex items-center gap-4 bg-muted/10 p-4 rounded-lg border border-border/40">
                 <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-black text-xl tracking-tighter uppercase shadow-inner">
                   {session.username.substring(0,2)}
                 </div>
                 <div>
                   <p className="text-base font-bold text-foreground">{session.username}</p>
                   <div className="flex items-center gap-2 mt-0.5">
                      <span className="h-2 w-2 rounded-full bg-success"></span>
                      <p className="text-xs font-medium text-muted-foreground">Aktif / Terverifikasi</p>
                   </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Nama Pengguna</p>
                  <p className="text-sm font-medium text-foreground">{session.username}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Hak Akses Role</p>
                  <span className={
                    session.role === 'OWNER'   ? 'badge badge-warning' :
                    session.role === 'ADMIN'   ? 'badge badge-brand'   : 'badge badge-neutral'
                  }>{session.role}</span>
                </div>
              </div>
              
              <div className="pt-5 border-t border-border/50">
                 <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">System User ID</p>
                 <p className="text-xs font-mono text-muted-foreground bg-accent/30 inline-block px-2 py-1 rounded-sm border border-border/40">
                   {session.userId}
                 </p>
              </div>
            </div>
            <div className="bg-muted/30 px-6 py-3 border-t border-border/80 flex justify-end gap-3">
              <button type="button" disabled className="btn-ghost opacity-50 cursor-not-allowed">Ubah Sandi</button>
              <button type="button" disabled className="btn-primary opacity-50 cursor-not-allowed">Edit Profil</button>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="pt-2">
          <div className="bg-destructive/5 border border-destructive/20 rounded-xl overflow-hidden relative w-full">
            <div className="absolute top-0 left-0 w-1 h-full bg-destructive/60" />
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-destructive mb-1.5">Zona Bahaya</h3>
                <p className="text-xs font-medium text-destructive/80 max-w-2xl leading-relaxed">
                  Tindakan di bawah ini tidak dapat dibatalkan. Menghapus akun Anda akan menghapus semua kepemilikan data organisasi secara permanen dari server ex-POS.
                </p>
              </div>
              <button type="button" className="btn-danger shrink-0">Nonaktifkan / Hapus Akun</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
