import React,{useEffect,useState} from 'react';
import {BookOpen,CheckCircle2,PlayCircle,Clock,RefreshCw,GraduationCap,Lock} from 'lucide-react';
const label=v=>typeof v==='string'?v:(v?.ar||v?.fr||v?.en||'درس');
export default function StudentPortal({supabase,session,notify}){
 const [enrollments,setEnrollments]=useState([]),[selected,setSelected]=useState(null),[modules,setModules]=useState([]),[lessons,setLessons]=useState([]),[progress,setProgress]=useState([]),[active,setActive]=useState(null),[busy,setBusy]=useState(false);
 async function load(){if(!session?.user?.id)return;setBusy(true);
  const e=await supabase.from('enrollments').select('id,course_id,status,enrolled_at').eq('user_id',session.user.id).in('status',['active','approved']).order('enrolled_at',{ascending:false});
  if(e.error){notify(e.error.message);setBusy(false);return;}
  const ids=(e.data||[]).map(x=>x.course_id);
  const c=ids.length?await supabase.from('courses').select('id,slug,title,description,cover_path,level,price_usd,price_dzd').in('id',ids):{data:[],error:null};
  if(c.error)notify(c.error.message);
  const joined=(e.data||[]).map(x=>({...x,course:(c.data||[]).find(y=>y.id===x.course_id)})).filter(x=>x.course);
  setEnrollments(joined);if(selected){const still=joined.find(x=>x.course_id===selected.course_id);if(still)setSelected(still);else setSelected(null);}
  setBusy(false);
 }
 async function openCourse(item){setSelected(item);setActive(null);setBusy(true);
  const m=await supabase.from('course_modules').select('id,title,description,sort_order').eq('course_id',item.course_id).eq('is_published',true).order('sort_order');
  if(m.error){notify(m.error.message);setBusy(false);return;}
  setModules(m.data||[]);const mids=(m.data||[]).map(x=>x.id);
  const l=mids.length?await supabase.from('lessons').select('id,module_id,title,content,video_provider,video_asset_id,duration_seconds,sort_order,is_preview').in('module_id',mids).eq('is_published',true).order('sort_order'):{data:[],error:null};
  if(l.error)notify(l.error.message);setLessons(l.data||[]);
  const p=await supabase.from('lesson_progress').select('lesson_id,progress_seconds,completed,completed_at').eq('user_id',session.user.id);
  if(p.error)notify(p.error.message);setProgress(p.data||[]);setBusy(false);
 }
 async function completeLesson(lesson){const {error}=await supabase.from('lesson_progress').upsert({user_id:session.user.id,lesson_id:lesson.id,progress_seconds:lesson.duration_seconds||0,completed:true,completed_at:new Date().toISOString(),updated_at:new Date().toISOString()},{onConflict:'user_id,lesson_id'});if(error)notify(error.message);else{setProgress(v=>[...v.filter(x=>x.lesson_id!==lesson.id),{lesson_id:lesson.id,completed:true}]);notify('تم تسجيل إكمال الدرس');}}
 const completed=lessons.filter(l=>progress.some(p=>p.lesson_id===l.id&&p.completed)).length;
 return <section className="student-portal" dir="rtl">
  <div className="student-head"><div><span className="eyebrow">مساحتك التعليمية</span><h2>مرحباً بعودتك</h2><p>تابع تقدمك وأكمل رحلتك في التعلم.</p></div><button className="btn ghost" onClick={load}><RefreshCw size={16}/> تحديث</button></div>
  {!selected?<><div className="student-summary"><div><GraduationCap/><b>{enrollments.length}</b><span>دوراتك النشطة</span></div><div><CheckCircle2/><b>{enrollments.reduce((n,x)=>n+0,0)}</b><span>ابدأ بإكمال الدروس</span></div></div>{busy?<div className="student-empty">جار تحميل دوراتك…</div>:enrollments.length?<div className="student-courses">{enrollments.map(item=><article className="student-course" key={item.id}><div className="student-course-icon"><BookOpen/></div><div><h3>{label(item.course.title)}</h3><p>{label(item.course.description)}</p><small>{item.course.level||'—'} · بدأ التسجيل {new Date(item.enrolled_at).toLocaleDateString('ar-DZ')}</small></div><button className="btn primary" onClick={()=>openCourse(item)}>متابعة التعلم</button></article>)}</div>:<div className="student-empty"><BookOpen/><b>لا توجد دورات نشطة في حسابك بعد</b><span>بعد التسجيل في دورة واعتماد الدفع ستظهر هنا تلقائياً.</span><a className="btn primary" href="#courses">استكشف الدورات</a></div>}</>:
  <><button className="btn ghost" onClick={()=>setSelected(null)}>← العودة إلى دوراتي</button><div className="learning-workspace"><aside className="lesson-sidebar"><h3>{label(selected.course.title)}</h3><div className="progress-line"><span style={{width:lessons.length?(completed/lessons.length*100)+'%':'0%'}}/></div><small>{completed} من {lessons.length} دروس مكتملة</small>{modules.map(m=><div className="module-group" key={m.id}><b>{label(m.title)}</b>{lessons.filter(l=>l.module_id===m.id).map(l=><button key={l.id} className={active?.id===l.id?'current':''} onClick={()=>setActive(l)}><PlayCircle size={15}/>{label(l.title)}{progress.some(p=>p.lesson_id===l.id&&p.completed)&&<CheckCircle2 size={14}/>}</button>)}</div>)}</aside><article className="lesson-content">{active?<><span className="eyebrow">الدرس الحالي</span><h2>{label(active.title)}</h2><div className="lesson-meta"><span><Clock size={14}/> {Math.ceil((active.duration_seconds||0)/60)} دقيقة</span>{active.is_preview&&<span>معاينة مجانية</span>}</div><div className="lesson-body">{label(active.content)||'محتوى الدرس سيظهر هنا.'}</div>{active.video_provider&&<div className="video-placeholder"><Lock/><b>محتوى الفيديو محمي</b><span>تشغيل الفيديو الآمن يُفعّل بعد إصدار رابط مشاهدة مؤقت من الخادم.</span></div>}<button className="btn primary" onClick={()=>completeLesson(active)} disabled={progress.some(p=>p.lesson_id===active.id&&p.completed)}><CheckCircle2 size={16}/>{progress.some(p=>p.lesson_id===active.id&&p.completed)?'أكملت هذا الدرس':'تحديد الدرس كمكتمل'}</button></>:<div className="student-empty"><PlayCircle/><b>اختر درساً من القائمة لبدء التعلم</b></div>}</article></div></>}
 </section>;
}
