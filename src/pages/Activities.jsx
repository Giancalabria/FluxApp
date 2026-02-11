import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Fab,
  Skeleton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/AddRounded';
import GroupIcon from '@mui/icons-material/GroupsRounded';
import { useNavigate } from 'react-router-dom';
import { useActivities } from '../hooks/useActivities';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { activityMemberService } from '../services/activityMemberService';
import ActivityFormDialog from '../components/activities/ActivityFormDialog';
import EmptyState from '../components/common/EmptyState';

export default function Activities() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const { activities, loading, createActivity } = useActivities();
  const [formOpen, setFormOpen] = useState(false);

  const displayName = profile?.username || user?.email?.split('@')[0] || 'Me';

  const handleSave = async (values) => {
    const { data, error } = await createActivity({
      name: values.name,
      currency: values.currency,
      created_by: user?.id,
    });
    if (error) return;
    if (data?.id) {
      await activityMemberService.create({
        activity_id: data.id,
        name: displayName,
        user_id: user?.id ?? null,
      });
    }
    setFormOpen(false);
    navigate(`/activities/${data.id}`);
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Split
        </Typography>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" height={88} sx={{ mb: 1.5 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Split
      </Typography>

      {activities.length === 0 ? (
        <EmptyState
          icon={GroupIcon}
          title="No activities yet"
          subtitle="Create an activity to split expenses with friends (e.g. a trip or shared dinner)."
          actionLabel="New Activity"
          onAction={() => setFormOpen(true)}
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {activities.map((act) => (
            <Card key={act.id}>
              <CardActionArea onClick={() => navigate(`/activities/${act.id}`)}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" fontWeight={600} noWrap>
                      {act.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {act.currency}
                    </Typography>
                  </Box>
                  <Chip label={act.currency} size="small" color="primary" variant="outlined" />
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      )}

      <Fab
        color="primary"
        onClick={() => setFormOpen(true)}
        sx={{
          position: 'fixed',
          bottom: { xs: 'calc(60px + env(safe-area-inset-bottom, 0px) + 16px)', md: 24 },
          right: 24,
        }}
      >
        <AddIcon />
      </Fab>

      <ActivityFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
      />
    </Box>
  );
}
